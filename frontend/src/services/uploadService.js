import API from "./api";

export const uploadFoodImage = async (file) => {
  const formData = new FormData();

  formData.append("image", file);

  const response = await API.post("/upload/food-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data?.image_url || "";
};