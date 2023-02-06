const ipfsEndpoint = "https://ipfs-relay.crossbell.io";

export const uploadFile = async (file: File | Blob) => {
  const formData = new FormData();
  formData.append("file", file);

  const result = await fetch(`${ipfsEndpoint}/upload`, {
    method: "PUT",
    body: formData,
  });

  if (result.ok) {
    const res = await result.json();
    return res.url;
  }
};

export const uploadJson = async (data: object) => {
  const result = await fetch(`${ipfsEndpoint}/json`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (result.ok) {
    const res = await result.json();
    return res.url;
  }
};
