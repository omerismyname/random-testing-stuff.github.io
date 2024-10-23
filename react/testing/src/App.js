import './App.css';
import { useEffect, useState } from 'react';
import { Octokit } from "octokit";

let timesCalledGitHubAPI = 0;

export default function App() {
  const [tree, setTree] = useState(null);
  const [dir, setDir] = useState(
    window.history.state ||
    new URLSearchParams(new URL(window.location.href).search).get("dir") ||
    "web-stuff"
  );
  const octokit = new Octokit();

  useEffect(() => {
    timesCalledGitHubAPI++;
    if (timesCalledGitHubAPI > 100) return;
    octokit.request('GET /repos/mcnomer/random-testing-stuff/contents/' + dir, {
      owner: 'mcnomer',
      repo: 'random-testing-stuff',
      path: '/'
    })
    .then(response => {
      if (response.status === 200) {
        return response;
      }
    })
    .then(response => response.data)
    .then(responseTree => {
      setTree(responseTree);
    });
  }, [dir]);

  window.onpopstate = () => {
    setDir(
      window.history.state ||
      new URLSearchParams(new URL(window.location.href).search).get("dir") ||
      "web-stuff"
    );
  };
  return (
    <div className="app">
      <header>
        <a href="/">
          <img src="/favicons/icon-144.png" alt="Logo"/>  
        </a>
      </header>
      <Explorer tree={tree} dir={dir} setDir={setDir}></Explorer>
    </div>
  );
}

function Explorer({tree, dir, setDir}) {
  if (tree === null) return <div></div>;
  let elements = parseTree(tree, dir).map(f => {
    if (f.type === "dir") return <Folder key={f.sha} folder={f} setDir={setDir}></Folder>
    else return <File key={f.sha} file={f} dir={dir}></File>
  });
  // add back button if not in root
  if (dir !== "web-stuff") elements.unshift(
    <div key="back" className="item" onClick={() => window.history.back()}>
      <img className="item-icon" src="/icons/back.svg" alt="back"></img>
    </div>
  );
  return (
    <main className="explorer">
      {elements}
    </main>
  );
}

function Folder({folder, setDir}) {
  const folderName = folder.path.split("/").pop();
  return (
    <div className="item" onClick={() => {
      setDir(folder.path);
      window.history.pushState(folder.path, "Testing - " + folderName, `?dir=${encodeURIComponent(folder.path)}`);
    }}>
      <img className="item-icon" src="/icons/folder.svg" alt="folder"></img>
      <span className="item-name">{folderName}</span>
    </div>
  );
}

function File({file, dir}) {
  return (
    <a href={"/" + file.path}>
      <div className="item">
        <img className="item-icon" src="/icons/file.svg" alt="file"></img>
        <span className="item-name">{file.path.split("/").pop()}</span>
        <span className="item-size">{fileSizeToString(file.size)}</span>
      </div>
    </a>
  );
}

function parseTree(tree, dir) {
  const currentDirChildren = [];
  const treeDepth = dir.split("/").length + 1;
  for (let i = 0; i < tree.length; i++) {
    // if on same branch at same depth then add to array for display
    if (tree[i].path.startsWith(dir) && tree[i].path.split("/").length === treeDepth) {
      currentDirChildren.push(tree[i]);
    }
  };
  return currentDirChildren;
}

function fileSizeToString(fileSize) {
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const pow = Math.max(Math.min(Math.floor(Math.log10(fileSize) / 3), 5), 0);
  return Math.round((fileSize / (1000**pow))*100)/100 + units[pow];
}