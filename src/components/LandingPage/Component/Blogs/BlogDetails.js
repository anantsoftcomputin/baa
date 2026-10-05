import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Container,
  Grid,
  styled,
  Typography,
} from "@mui/material";
import ajaxCall from "../../../helpers/ajaxCall";
import { useParams } from "react-router-dom";

const BlogDetails = () => {
  const { BlogId } = useParams();

  const [blogData, setBlogData] = useState([]);

  const Event = blogData.filter((item) => item.id === parseInt(BlogId));

  const fetchData = async (url, setData) => {
    try {
      const response = await ajaxCall(
        url,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "GET",
        },
        8000
      );
      if (response?.status === 200) {
        setData(response?.data || []);
      } else {
        console.error("Fetch error:", response);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    fetchData("blog/bloglistsview", setBlogData);
  }, []);

  const BackgroundImage = styled("div")(({ bgImage }) => ({
    width: "100%",
    height: "400px",
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
  }));

  return (
    <>
      <Container sx={{ mt: 1 }}>
        {Event.map((event, index) => (
          <Card
            key={index}
            sx={{ mt: 4, boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)" }}
          >
            <Grid container>
              <Grid item xs={12}>
                <BackgroundImage bgImage={event.image} />
              </Grid>
            </Grid>

            <Grid container>
              <Grid item xs={12} md={8} mt={4}>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
                    {event.title}
                  </Typography>

                  <Typography variant="body1" paragraph>
                    {event.text}
                  </Typography>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        ))}
      </Container>
    </>
  );
};

export default BlogDetails;
