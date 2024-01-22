const fileUpload = ({ res, file }) => {
  try {
    console.log(file);
    res.status(200).json({
      message: "Файл успешно загружен",
      fileData: {
        type: file.mimetype,
        originalName: file.originalname,
        fileName: file.filename,
        size: file.size,
      },
    });
  } catch (err) {
    res.status(400).json({ error: "Ошибка при загрузке файла" });
  }
};

module.exports = {
  fileUpload,
};
