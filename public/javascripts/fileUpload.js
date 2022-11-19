FilePond.registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageResize,
  FilePondPluginFileEncode
);

FilePond.setOptions({
  stylePanelAspectRatio: 1.5 / 1,
  imageResizeTargetWidth: 150,
  imageResizeTargetWidth: 100
});

FilePond.parse(document.body);
