# Recreate the asset folder
1. go to [onedrive](https://onedrive.live.com/)
2. open console with devtools
3. Paste `JSON.stringify([].slice.call(document.getElementsByClassName("image_dc459042")).map(x=>x.src))`
4. create img_urls.json and copy & paste the img_urls
5. remove the `'` from the end and begining of the file
6. run `node download.js`