let canvas = document.querySelector("canvas");
// canvas dimension -> screen dimensions
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
const tool = canvas.getContext("2d");

let undoStack = [];
let redoStack = [];
let isMouseDown = false;

canvas.addEventListener("mousedown", function (e) {
  console.log("mouse down event", "x: ", e.clientX, "y: ", e.clientY);
  tool.beginPath();
  let x = e.clientX,
    y = getCoordinates(e.clientY);
  tool.moveTo(x, y);
  isMouseDown = true;
  let pointDesc = {
    x: x,
    y: y,
    desc: "md",
  };
  undoStack.push(pointDesc);
});

canvas.addEventListener("mousemove", function (e) {
  // console.log("mouse move event", "x: ", e.clientX, "y: ", e.clientY);
  if (isMouseDown) {
    let x = e.clientX,
      y = getCoordinates(e.clientY);
    tool.lineTo(x, y);
    tool.stroke();
    let pointDesc = {
      x: x,
      y: y,
      desc: "mm",
    };
    undoStack.push(pointDesc);
  }
});
canvas.addEventListener("mouseup", function (e) {
  isMouseDown = false;
});

function getCoordinates(y) {
  let bounds = canvas.getBoundingClientRect();
  return y - bounds.y;
}

let tools = document.querySelectorAll(".tool-image");
for (let i = 0; i < tools.length; i++) {
  tools[i].addEventListener("click", function (e) {
    let cTool = e.currentTarget;
    let name = cTool.getAttribute("id");
    if (name == "pencil") {
      tool.strokeStyle = "black";
    } else if (name == "eraser") {
      tool.strokeStyle = erasercolor;
    } else if (name == "sticky") {
      createSticky();
    } else if (name == "undo") {
      undomaker();
    } else if (name == "redo") {
      redomaker();
    } else if (name == "download") {
      downloadBoard();
    } else if (name == "upload") {
      uploadFile();
    }
  });
}

function createBox() {
  let stickyPad = document.createElement("div");
  let navBar = document.createElement("div");
  let close = document.createElement("div");
  let minimize = document.createElement("div");
  let textArea = document.createElement("div");

  stickyPad.setAttribute("class", "stickypad");
  navBar.setAttribute("class", "nav-bar");
  close.setAttribute("class", "close");
  minimize.setAttribute("class", "minimize");
  textArea.setAttribute("class", "text-area");
  navBar.appendChild(minimize);
  navBar.appendChild(close);
  stickyPad.appendChild(navBar);
  stickyPad.appendChild(textArea);
  document.body.appendChild(stickyPad);
  let initialX = null;
  let initialY = null;
  let isStickyDown = false;
  let isMinimized = false;

  // sticky code
  navBar.addEventListener("mousedown", function (e) {
    // initial point
    initialX = e.clientX;
    initialY = e.clientY;
    isStickyDown = true;
  });
  
  canvas.addEventListener("mousemove", function (e) {
    if (isStickyDown == true) {
      // final point
      let finalX = e.clientX;
      let finalY = e.clientY;
      //  distance
      let dx = finalX - initialX;
      let dy = finalY - initialY;
      //  move sticky
      //original top left
      let { top, left } = stickyPad.getBoundingClientRect();
      // stickyPad.style.top=10+"px";
      stickyPad.style.top = top + dy + "px";
      stickyPad.style.left = left + dx + "px";
      initialX = finalX;
      initialY = finalY;
    }
  });
  window.addEventListener("mouseup", function () {
    isStickyDown = false;
  });
  minimize.addEventListener("click", function () {
    if (isMinimized) {
      textArea.style.display = "none";
    } else {
      textArea.style.display = "block";
    }
    isMinimized = !isMinimized;
  });
  close.addEventListener("click", function () {
    stickyPad.remove();
  });
  return textArea;
}

// ***********sticky******************
function createSticky() {
  let textArea = createBox();
  let textBox = document.createElement("textarea");
  textBox.setAttribute("class", "textarea");
  // create subtree
  textArea.appendChild(textBox);
  // add subtree to page
}

// *********undo ****************
function undomaker() {
  // clear board
  tool.clearRect(0, 0, canvas.width, canvas.height);
  // pop last point
  // undoStack.pop();
  while (undoStack.length > 0) {
    let curObj = undoStack[undoStack.length - 1];
    if (curObj.desc == "md") {
      redoStack.push(undoStack.pop());
      break;
    } else if (curObj.desc == "mm") {
      redoStack.push(undoStack.pop());
    }
  }
  // redraw
  redraw();
}


// ************redo*************
function redomaker() {
  tool.clearRect(0, 0, canvas.width, canvas.height);
  while (redoStack.length > 0) {
    let curObj = redoStack[redoStack.length - 1];
    if (curObj.desc == "md") {
      undoStack.push(redoStack.pop());
      break;
    } else if (curObj.desc == "mm") {
      undoStack.push(redoStack.pop());
    }
  }
  redraw();
}

function redraw() {
  for (let i = 0; i < undoStack.length; i++) {
    let { x, y, desc } = undoStack[i];
    if (desc == "md") {
      tool.beginPath();
      tool.moveTo(x, y);
    } else if (desc == "mm") {
      tool.lineTo(x, y);
      tool.stroke();
    }
  }
}

function downloadBoard() {;
  let a = document.createElement("a");
  //  set filename to it's download attribute
  a.download = "file.png";
  //  convert board to url
  let url = canvas.toDataURL("image/jpeg;base64");
  //  set as href of anchor
  a.href = url;
  // click the anchor
  a.click();
}


// upload download image
let imgInput = document.querySelector("#acceptImg");
// dialog box open
function uploadFile() {
  // dialog box select ok
  imgInput.click();
  imgInput.addEventListener("change", function () {
    console.log(imgInput.files);
    let imgObj = imgInput.files[0];
    // console.log(imgObj);
    // img => link
    let imgLink = URL.createObjectURL(imgObj);
    let textBox = createBox();
    let img = document.createElement("img");
    img.setAttribute("class", "upload-img");
    img.src = imgLink;
    textBox.appendChild(img);
  });
}

// color and size
function changecolor(value) {
  tool.strokeStyle = value;
}

function pensizeChange(value) {
  tool.lineWidth = value;
}

function erasersizeChange(value) {
  tool.lineWidth = value;
}

var u = 0;
let b = document.querySelector("#hide");
let hider = document.querySelector(".hider");
function hideHeader() {
  u++;
  if (u % 2 == 0) {
    hider.style.display = "none";
  } else hider.style.display = "inline";
}

let darktheme = false;
let d = 0;
let dark = document.querySelector("#darklight");
let erasercolor="white";
dark.addEventListener("click", function () {
  if (d % 2 == 0) {
    tool.fillStyle = "black";
    tool.fillRect(0, 0, canvas.width, canvas.height);
    tool.strokeStyle = "white";
    erasercolor="black";
    darktheme = true;
  } else {
    tool.fillStyle = "white";
    tool.fillRect(0, 0, canvas.width, canvas.height);
    tool.strokeStyle = "black";
    erasercolor="white";
    darktheme = false;
  }
  d++;
});
