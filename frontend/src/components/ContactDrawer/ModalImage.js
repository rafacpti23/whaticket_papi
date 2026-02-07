import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import ModalImage from "react-modal-image";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
  messageMedia: {
    objectFit: "cover",
    margin: 15,
    width: 140,
    height: 140,
    borderRadius: 10,
  },
}));

const ModalImageContatc = ({ imageUrl }) => {
  const classes = useStyles();
  const [fetching, setFetching] = useState(true);
  const [blobUrl, setBlobUrl] = useState("");


  useEffect(() => {
    // More comprehensive validation
    if (!imageUrl || imageUrl === '' || imageUrl === 'null' || imageUrl === 'undefined') {
      setFetching(false);
      return;
    }

    // Validate URL before fetching
    try {
      // Check if it's a valid URL (absolute or relative starting with /)
      const trimmedUrl = String(imageUrl).trim();
      if (!trimmedUrl || trimmedUrl.length < 2) {
        console.warn('Invalid image URL (too short or empty):', imageUrl);
        setFetching(false);
        return;
      }

      if (!trimmedUrl.startsWith('http') && !trimmedUrl.startsWith('/')) {
        console.warn('Invalid image URL (invalid protocol):', imageUrl);
        setFetching(false);
        return;
      }
    } catch (e) {
      console.warn('Error validating image URL:', e);
      setFetching(false);
      return;
    }

    const fetchImage = async () => {
      try {
        const { data, headers } = await api.get(imageUrl, {
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(
          new Blob([data], { type: headers["content-type"] })
        );
        setBlobUrl(url);
        setFetching(false);
      } catch (error) {
        console.error('Error fetching image:', error);
        setFetching(false);
      }
    };
    fetchImage();
  }, [imageUrl]);

  return (
    <ModalImage
      className={classes.messageMedia}
      smallSrcSet={fetching ? imageUrl : blobUrl}
      medium={fetching ? imageUrl : blobUrl}
      large={fetching ? imageUrl : blobUrl}
      showRotate="true"
      alt="image"
    />
  );
};


export default ModalImageContatc;