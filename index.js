const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browsebtn");
const fileInput = document.querySelector("#fileinput");

const progressContainer = document.querySelector("progress-container");

const bgProgress = document.querySelector("bg-progress");
const progressBar = document.querySelector("progress-bar");

const percentdiv = document.querySelector("#percent");

const sharingContainer = document.querySelector(".sharing-container");
const fileURLInput = document.querySelector("#fileURL");

const copyBtn = document.querySelector("#copyBtn");
const emailForm =document.querySelector("#emailForm");


const host = "https://inshare-umangus.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

const toast = document.querySelector(".toast");

const maxAllowedSize = 100*1024*1024 ; //100mb

//const uploadURL = `${host}api/files`;

dropZone.addEventListener("dragover",(e)=>{

    e.preventDefault();

    console.log("draging");
    if(!dropZone.classList.contains("dragged"))
    {
        dropZone.classList.add("dragged");
    }
    const files=e.dataTransfer.files;

    if(files.length)
    {
        fileInput.files = files;    
    }
    
    uploadFile(); 


});


dropZone.addEventListener("drop" , (e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");

});

dropZone.addEventListener("dragleave" , ()=>{
    dropZone.classList.remove("dragged");
});


browseBtn.addEventListener("click",()=>{
    fileInput.click();    

});


copyBtn.addEventListener("click",()=>{
    
    fileURLInput.select();
    document.execCommand("copy"); 
    showToast("Link copied to clipboard");

});

/*-------------imp upload file ------ */
const uploadFile = () =>{
    

    if(fileInput.files.length > 1)
    {
        resetFileInput();
        showToast("Upload only 1 file!");
        return;
    }
    const file = fileInput.files[0];

    if(file.size >maxAllowedSize)
    {
        showToast("Can't upload more than 100MB");
        resetFileInput();

    }

    progressContainer.style.display ="block";

    const formData = new FormData();
    formData.append("myfile",file);

    const xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = () =>{

        if(xhr.readyState === XMLHttpRequest.DONE)
        {
             console.log(xhr.response);
             onUploadSuccess(JSON.parse(xhr.response));
        }
        
    };

    xhr.upload.onprogress = updateProgress;
    xhr.upload.onerror = ()=>{
        resetFileInput();
        showToast(`Error in upload: ${xhr.statusText} `);
    };

    xhr.open("POST" , uploadURL);
    xhr.send(formData);
};

const resetFileInput = ()=>{
    fileInput.value="";
}

const updateProgress = (e) =>{ 

    const percent = Math.round((e.loaded / e.total )*100);
  //  console.log(percent);

    bgProgress.style.width = `${percent}%`;  
    percentdiv.innerText = percent;

    progressBar.style.transform = `scaleX(${percent/100}%)`;


};

// 1:32:00

const onUploadSuccess = ({file: url}) =>{
 
    console.log(file);
    resetFileInput();
    emailForm[2].removeAttribute("disabled");
    progressContainer.style.display ="none";
    fileURLInput.value = url;
    sharingContainer.style.display ="block";
}


emailForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    console.log("submit form ");

    const url=fileURLInput.value;
    const formData={

        uuid: url.split("/").splice(-1,1)[0] ,
        emailTo:emailForm.elements["to-email"].value,
        emailFrom:emailForm.elements["from-email"].value,

    };


    emailForm[2].setAttribute("disabled","true");

    console.table(formData);

    fetch(emailURL,{
        method: "POST",
        headers : {
            "Content-Type" :"application/json"
        },
        body : JSON.stringify(formData)
    }).then(res => res.json())
    .then(({success}) =>{

        if(success)
        {
            sharingContainer.style.display ="none";
            showToast("Email Sent");
        }

    });

});

let toastTimer;


const showToast = (msg) => {
    toast.innerText=msg;
    toast.style.transform ="translate(-50%,0)";

    clearTimeout(toastTimer);

    toastTimer = setTimeout(()=>{
    toast.style.transform ="translate(-50%,60px)";
    },2000);

};




// undraw.co/illustration
// mdn media query