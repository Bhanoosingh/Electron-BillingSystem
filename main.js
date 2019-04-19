console.log('main process working');

const electron=require("electron");
const app=electron.app;
const BrowserWindow=electron.BrowserWindow;
const path=require("path");
const url=require("url");
///////////////////////////////////////////////////////

const fs=require('fs');
const os=require('os');
const ipc=electron.ipcMain;
const shell=electron.shell;





let win;

function createWindow(){
  win=new BrowserWindow();
  win.loadURL(url.format({
    pathname:path.join(__dirname,'index.html'),
    protocol:'file',
    slashes:true
  }));

  win.on('closed',()=>{
    win=null;
  })
}

app.on('ready',createWindow);

app.on('window-all-closed',()=>{
  if(process.platform !=='darwin'){
    app.quit();
  }
});

app.on('activate',()=>{
  if(win===null){
    createWindow();
  }
});


ipc.on('print-to-pdf',function(event){
  const pdfPath=path.join(os.tmpdir(),'print.pdf');
  const win =BrowserWindow.fromWebContents(event.sender);

  win.webContents.printToPDF({},function(error,data){
    if(error) return console.log(error.message);

    fs.writeFile(pdfPath,data,function(err){
      if(err) return console.log(err.message);
      shell.openExternal('file://'+pdfPath);
      event.sender.send('wrote-pdf',pdfPath);
    });
  })
});
