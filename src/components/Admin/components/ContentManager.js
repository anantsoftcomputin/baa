import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Rating,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { toast } from "react-toastify";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../../firebase/config";
import { logAdminAction } from "../../../firebase/analytics";
import { imageOf } from "../../../utils/format";

export const MAX_IMAGE_MB = 10;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Returns an error message for an unacceptable image, or "" if it's fine. */
export const imageProblem = (file) => {
  if (!file) return "";
  if (!file.type || !file.type.startsWith("image/")) return `"${file.name}" is not an image.`;
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `"${file.name}" is larger than ${MAX_IMAGE_MB} MB.`;
  return "";
};

const safeName = (name) => String(name || "image").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80);

export const uploadImageTo = async (folder, file) => {
  const storageRef = ref(storage, `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${safeName(file.name)}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
};

/** Removes an uploaded image if it lives in our bucket. Never throws. */
export const deleteStoredImage = async (url) => {
  if (!url || !/firebasestorage|appspot|127\.0\.0\.1|localhost/.test(url)) return;
  try {
    await deleteObject(ref(storage, url));
  } catch (_) {
    /* already gone, or not ours */
  }
};

/** Builds the form state for an item, mapping legacy field names. */
const toForm = (fields, item) => {
  const form = {};
  fields.forEach((f) => {
    const raw = f.read ? f.read(item || {}) : item?.[f.name];
    if (f.type === "tags") form[f.name] = Array.isArray(raw) ? raw.join(", ") : raw || "";
    else if (f.type === "rating") form[f.name] = raw == null || raw === "" ? f.default ?? 5 : Number(raw) || 0;
    else form[f.name] = raw == null ? f.default ?? "" : String(raw);
  });
  form.imageUrl = imageOf(item) || "";
  return form;
};

/** Converts form state into the document to save. */
const toDoc = (fields, form) => {
  const doc = {};
  fields.forEach((f) => {
    const v = form[f.name];
    if (f.type === "number") {
      const n = parseFloat(v);
      doc[f.name] = Number.isFinite(n) ? n : null;
    } else if (f.type === "tags") {
      doc[f.name] = String(v || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (f.type === "rating") {
      doc[f.name] = Number(v) || 0;
    } else {
      doc[f.name] = typeof v === "string" ? v.trim() : v ?? "";
    }
    if (f.write) Object.assign(doc, f.write(form, doc[f.name]));
  });
  return doc;
};

const FieldInput = ({ field, value, onChange, error, options }) => {
  const common = {
    fullWidth: true,
    label: field.label,
    value: value ?? "",
    required: field.required,
    error: !!error,
    helperText: error || field.helperText,
    onChange: (e) => onChange(e.target.value),
    inputProps: { "data-field": field.name },
  };

  if (field.type === "rating") {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {field.label}
        </Typography>
        <Rating value={Number(value) || 0} onChange={(_, v) => onChange(v ?? 0)} />
      </Box>
    );
  }
  if (field.type === "select") {
    const opts = [...(options || field.options || [])];
    // Keep a value that's no longer in the list (e.g. a deleted event) selectable instead of blanking it.
    if (value && !opts.some((o) => o.value === value)) opts.unshift({ value, label: field.missingLabel ? field.missingLabel(value) : value });
    return (
      <TextField select {...common}>
        {field.allowEmpty && (
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
        )}
        {opts.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }
  if (field.type === "textarea") return <TextField {...common} multiline minRows={field.rows || 4} />;
  if (field.type === "number") {
    return (
      <TextField
        {...common}
        inputProps={{ ...common.inputProps, inputMode: "decimal" }}
        InputProps={field.prefix ? { startAdornment: <InputAdornment position="start">{field.prefix}</InputAdornment> } : undefined}
      />
    );
  }
  if (field.type === "date") {
    // Older records may hold free-text dates; edit those as text so nothing is lost.
    const asText = value && !ISO_DATE.test(value);
    return <TextField {...common} type={asText ? "text" : "date"} InputLabelProps={{ shrink: true }} helperText={error || (asText ? "Use YYYY-MM-DD" : field.helperText)} />;
  }
  return <TextField {...common} type={field.inputType || "text"} />;
};

/**
 * Generic list + editor for an admin-managed collection.
 *
 * config: {
 *   title, singular, description, storageFolder,
 *   api: { list, create, update, remove },
 *   fields: [{ name, label, type, required, options, helperText, grid, read(item), write(form, value) }],
 *   columns: DataGrid column defs (thumbnail and actions are added automatically),
 *   searchKeys: [field names], imageRequired, multipleUpload, sortRows(a, b), extraOptions: { [field]: () => Promise<options> }
 * }
 */
const ContentManager = ({ config }) => {
  const { title, singular, description, storageFolder, api, fields, columns = [], searchKeys = [], imageRequired, multipleUpload } = config;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, item = edit
  const [form, setForm] = useState({});
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.list();
      setRows(config.sortRows ? [...data].sort(config.sortRows) : data);
    } catch (e) {
      console.error(`Error loading ${title}:`, e);
      toast.error(`Couldn't load ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [api, config.sortRows, title]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const loaders = config.extraOptions || {};
    Object.entries(loaders).forEach(([name, fn]) =>
      fn()
        .then((opts) => setDynamicOptions((o) => ({ ...o, [name]: opts })))
        .catch(() => {})
    );
  }, [config.extraOptions]);

  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p)), [previews]);

  const isNew = editing && !editing.id;
  const allowMultiple = multipleUpload && isNew;

  const open = (item = {}) => {
    setEditing(item);
    setForm(toForm(fields, item));
    setFiles([]);
    setPreviews([]);
    setErrors({});
  };

  const close = () => {
    if (saving) return;
    setEditing(null);
  };

  const pickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    if (!picked.length) return;
    const problem = picked.map(imageProblem).find(Boolean);
    if (problem) {
      toast.error(problem);
      return;
    }
    const next = allowMultiple ? picked : picked.slice(0, 1);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    setErrors((er) => ({ ...er, image: "" }));
  };

  const validate = () => {
    const next = {};
    fields.forEach((f) => {
      const v = form[f.name];
      if (f.required && (v == null || String(v).trim() === "")) next[f.name] = `${f.label} is required`;
      if (f.type === "number" && v !== "" && v != null && !Number.isFinite(parseFloat(v))) next[f.name] = "Enter a number";
      if (f.type === "email" && v && !/^\S+@\S+\.\S+$/.test(v)) next[f.name] = "Enter a valid email";
      if (f.validate) {
        const msg = f.validate(v, form);
        if (msg) next[f.name] = msg;
      }
    });
    if (imageRequired && !files.length && !form.imageUrl) next.image = "Please add an image";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const base = toDoc(fields, form);
      if (isNew) {
        const urls = files.length ? await Promise.all(files.map((f) => uploadImageTo(storageFolder, f))) : [form.imageUrl || ""];
        for (let i = 0; i < urls.length; i += 1) {
          const docData = { ...base, imageUrl: urls[i] };
          if (urls.length > 1 && config.numberTitles) docData[config.numberTitles] = `${base[config.numberTitles]} ${i + 1}`;
          const res = await api.create(docData);
          logAdminAction("create", storageFolder, res?.id);
        }
        toast.success(urls.length > 1 ? `${urls.length} ${title.toLowerCase()} added` : `${singular} added`);
      } else {
        const imageUrl = files.length ? await uploadImageTo(storageFolder, files[0]) : form.imageUrl || "";
        const payload = { ...base, imageUrl };
        // Older documents keep their picture in `image`; clear it so the new choice wins.
        if (editing.image !== undefined) payload.image = "";
        await api.update(editing.id, payload);
        logAdminAction("update", storageFolder, editing.id);
        // An image we stored earlier was replaced or removed: tidy it up.
        const previous = imageOf(editing);
        if (previous && previous !== imageUrl) deleteStoredImage(previous);
        toast.success(`${singular} updated`);
      }
      setSaving(false);
      setEditing(null);
      load();
    } catch (e) {
      console.error(`Error saving ${singular}:`, e);
      toast.error(e?.code === "storage/unauthorized" || e?.code === "permission-denied" ? "You don't have permission to do that." : `Couldn't save the ${singular.toLowerCase()}. Please try again.`);
      setSaving(false);
    }
  };

  const remove = async () => {
    const item = confirmDelete;
    setDeleting(true);
    try {
      await api.remove(item.id);
      logAdminAction("delete", storageFolder, item.id);
      deleteStoredImage(imageOf(item));
      toast.success(`${singular} deleted`);
      setRows((r) => r.filter((x) => x.id !== item.id));
      setConfirmDelete(null);
    } catch (e) {
      console.error(`Error deleting ${singular}:`, e);
      toast.error(`Couldn't delete the ${singular.toLowerCase()}.`);
    } finally {
      setDeleting(false);
    }
  };

  const q = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      !q
        ? rows
        : rows.filter((r) =>
            searchKeys
              .map((k) => (Array.isArray(r[k]) ? r[k].join(" ") : r[k]))
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(q)
          ),
    [rows, q, searchKeys]
  );

  const gridColumns = [
    {
      field: "__image",
      headerName: "",
      width: 76,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Avatar variant="rounded" src={imageOf(p.row) || undefined} sx={{ width: 52, height: 40, bgcolor: "background.default", color: "text.secondary" }}>
          <ImageOutlinedIcon fontSize="small" />
        </Avatar>
      ),
    },
    ...columns,
    {
      field: "__actions",
      headerName: "",
      width: 100,
      sortable: false,
      filterable: false,
      align: "right",
      renderCell: (p) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" aria-label={`Edit ${p.row[fields[0].name] || singular}`} onClick={() => open(p.row)}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" aria-label={`Delete ${p.row[fields[0].name] || singular}`} onClick={() => setConfirmDelete(p.row)}>
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const shownImages = previews.length ? previews : form.imageUrl ? [form.imageUrl] : [];

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="h5">
            {title}{" "}
            <Typography component="span" color="text.secondary" sx={{ fontWeight: 500 }}>
              ({rows.length})
            </Typography>
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => open({})} sx={{ flexShrink: 0 }}>
          Add {singular.toLowerCase()}
        </Button>
      </Stack>

      {searchKeys.length > 0 && (
        <TextField
          size="small"
          placeholder={`Search ${title.toLowerCase()}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2, width: { xs: "100%", sm: 320 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      )}

      <DataGrid
        autoHeight
        rows={visible}
        columns={gridColumns}
        loading={loading}
        rowHeight={60}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        disableRowSelectionOnClick
        localeText={{ noRowsLabel: q ? "Nothing matches your search" : `No ${title.toLowerCase()} yet` }}
        sx={{ "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" } }}
      />

      <Dialog open={!!editing} onClose={close} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pr: 7 }}>
          {isNew ? `Add ${singular.toLowerCase()}` : `Edit ${singular.toLowerCase()}`}
          <IconButton onClick={close} disabled={saving} aria-label="Close" sx={{ position: "absolute", right: 12, top: 12 }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {fields.map((f) => (
              <Grid item xs={12} sm={f.grid || 12} key={f.name}>
                <FieldInput
                  field={f}
                  value={form[f.name]}
                  error={errors[f.name]}
                  options={dynamicOptions[f.name]}
                  onChange={(v) => {
                    setForm((s) => ({ ...s, [f.name]: v }));
                    if (errors[f.name]) setErrors((er) => ({ ...er, [f.name]: "" }));
                  }}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Typography variant="body2" color={errors.image ? "error" : "text.secondary"} sx={{ mb: 1 }}>
                {allowMultiple ? "Images (you can select several)" : "Image"}
                {imageRequired ? " *" : ""} · JPG/PNG/WebP up to {MAX_IMAGE_MB} MB
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                <Button variant="outlined" component="label" startIcon={<CloudUploadRoundedIcon />} disabled={saving}>
                  {shownImages.length ? (allowMultiple ? "Choose different images" : "Replace image") : allowMultiple ? "Choose images" : "Choose image"}
                  <input hidden type="file" accept="image/*" multiple={allowMultiple} onChange={pickFiles} data-testid="image-input" />
                </Button>
                {(files.length > 0 || form.imageUrl) && !imageRequired && (
                  <Button
                    color="inherit"
                    disabled={saving}
                    onClick={() => {
                      setFiles([]);
                      setPreviews([]);
                      setForm((s) => ({ ...s, imageUrl: "" }));
                    }}
                  >
                    Remove image
                  </Button>
                )}
              </Stack>
              {errors.image && (
                <Typography variant="caption" color="error">
                  {errors.image}
                </Typography>
              )}
              {shownImages.length > 0 && (
                <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
                  {shownImages.map((src, i) => (
                    <Box key={src + i} component="img" src={src} alt="" sx={{ height: 120, maxWidth: 220, objectFit: "cover", borderRadius: 2, border: "1px solid", borderColor: "divider" }} />
                  ))}
                </Stack>
              )}
              {files.length > 1 && config.numberTitles && (
                <Chip size="small" sx={{ mt: 1.5 }} label={`${files.length} entries will be created, numbered 1–${files.length}`} />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={save} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
            {saving ? "Saving…" : isNew ? `Add ${singular.toLowerCase()}` : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => !deleting && setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {singular.toLowerCase()}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            “{confirmDelete?.[fields[0].name] || singular}” will be removed from the website. This can't be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} color="inherit" disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={remove} color="error" variant="contained" disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentManager;
