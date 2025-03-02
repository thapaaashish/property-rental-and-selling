import { Cloudinary } from '@cloudinary/url-gen';

// Create a new Cloudinary instance
const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, // Use environment variable
  },
});

export default cld;