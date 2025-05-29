document.getElementById('export').addEventListener('click', async () => {
  // Lấy tab của cửa sổ hiện tại
  let [currentWindow] = await chrome.windows.getAll({populate: false, windowTypes: ['normal']});
  // chrome.windows.getCurrent() có thể dùng, nhưng đôi khi có thể sai window (popup, devtools), nên dùng getCurrent chính xác hơn
  currentWindow = await chrome.windows.getCurrent({populate: true});

  const tabs = currentWindow.tabs;
  if (!tabs) {
    alert("Không lấy được tab của cửa sổ hiện tại.");
    return;
  }

  const urls = tabs.map(tab => tab.url).join('\n');

  // Tạo file text và download
  const blob = new Blob([urls], {type: "text/plain"});
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url: url,
    filename: 'tabs_export.txt',
    saveAs: true
  }, () => {
    URL.revokeObjectURL(url);
  });
});

document.getElementById('import').addEventListener('click', () => {
  const fileInput = document.getElementById('fileInput');
  if (fileInput.files.length === 0) {
    alert("Vui lòng chọn file .txt chứa URL");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = async (event) => {
    const text = event.target.result;
    const urls = text.split('\n').map(u => u.trim()).filter(u => u.length > 0);

    if (urls.length === 0) {
      alert("File rỗng hoặc không chứa URL hợp lệ.");
      return;
    }

    // Mở các tab trong cửa sổ hiện tại
    const currentWindow = await chrome.windows.getCurrent();
    for (const url of urls) {
      chrome.tabs.create({ url: url, windowId: currentWindow.id });
    }
  };
  reader.readAsText(file);
});
