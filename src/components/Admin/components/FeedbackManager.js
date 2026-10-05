import React, { useEffect, useState } from "react";
import { Box, Card, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import { toast } from "react-toastify";
import { deleteFeedback, getFeedback } from "../../../firebase/firestore";
import EmptyState from "../../common/EmptyState";
import { InlineLoader } from "../../common/Loader";
import { formatDate } from "../../../utils/format";

/** Feedback sent from the floating "Share feedback" button on the website. */
const FeedbackManager = () => {
  const [items, setItems] = useState(null);

  const load = () =>
    getFeedback()
      .then(setItems)
      .catch(() => {
        toast.error("Failed to load feedback");
        setItems([]);
      });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await deleteFeedback(id);
      setItems((list) => list.filter((f) => f.id !== id));
    } catch (e) {
      toast.error("Couldn't delete feedback");
    }
  };

  return (
    <Box>
      <Typography variant="h5">Feedback</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        What visitors think of the website and the association.
      </Typography>
      {items === null ? (
        <InlineLoader />
      ) : items.length === 0 ? (
        <EmptyState icon={RateReviewRoundedIcon} title="No feedback yet" compact />
      ) : (
        <Stack spacing={1.5}>
          {items.map((f) => (
            <Card key={f.id} sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2">
                    {f.name}{" "}
                    <Typography component="span" variant="body2" color="text.secondary">
                      · {[f.email, f.mobile].filter(Boolean).join(" · ")}
                    </Typography>
                  </Typography>
                  <Typography sx={{ mt: 1, whiteSpace: "pre-line" }}>{f.feedback}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(f.createdAt)}
                  </Typography>
                </Box>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => remove(f.id)}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default FeedbackManager;
