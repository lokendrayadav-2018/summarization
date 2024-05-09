import { useState } from 'react';
import axios from 'axios';
import './form.css'
import { Vortex } from 'react-loader-spinner'
function UserForm() {
    const [source, setSource] = useState("1");
    const [output, setOutput] = useState("");
    const [showUrl, setShowUrl] = useState(false);
    const [showPdf, setShowPdf] = useState(false);
    const [showRawText, setShowRawText] = useState(true);
    const [rawText, setRawText] = useState("");
    const [url, setUrl] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const [type, setType] = useState("1");
    const [showLoader,setShowLoader] = useState(false);

    const handleChangeType= (event) =>{
        const val = event.target.value;
        setType(val);
        setOutput("");
    }
    const handleChangeSource = (event) => {
        const value = event.target.value;
        setShowUrl(value === "2");
        setShowPdf(value === "3");
        setShowRawText(value === "1");
        setSource(value);
        setRawText("");
        setUrl("");
        setOutput("");
        setPdfFile(null);
    };

    const handleRawTextChange = (event) => {
        setRawText(event.target.value);
        setOutput("");
    };

    const handleUrlChange = (event) => {
        setUrl(event.target.value);
        setOutput("");
    };

    const handlePdfChange = (event) => {
        setPdfFile(event.target.files[0]);
        setOutput("");
    };

    const handleSubmit = (event) => {
        setOutput("");
        event.preventDefault();
        // Prepare data based on the input
        const formData = new FormData();
        formData.append('type',type)
        formData.append('source',source)
        if (showRawText) {
            formData.append('text', rawText);
        } else if (showUrl) {
            formData.append('url', url);
        } else if (showPdf && pdfFile) {
            formData.append('file', pdfFile);
        }

        // Here you could send the formData to a server
        console.log('Form Data Ready for Submission:', Object.fromEntries(formData.entries()));
        setShowLoader(true)
        axios.post('http://localhost:5000/runscript', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }).then(response => {
            setShowLoader(false);
            console.log('Server Response:', response.data);
            setOutput(response.data.output);
        }).catch(err => {
            setShowLoader(false)
            console.error('API call error:', err);
        });
    };

    return (
        <div className="h-100 align-items-center justify-content-center">
            <div className="card">
                <div className="card-body">
                    <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-md-6">
                    <label htmlFor="type" className="form-label">Type</label>
                    <select id="type" value={type} defaultValue={"1"} className="form-select" onChange={handleChangeType}>
                        <option value="1" >Extractive</option>
                        <option value="2"> Abstractive </option>
                    </select>
                </div>
                <div className="col-md-6">
                    <label htmlFor="source" className="form-label">Source</label>
                    <select id="source" value={source} className="form-select" onChange={handleChangeSource}>
                        <option value="1">Raw Text</option>
                        <option value="2">URL</option>
                        <option value="3">PDF</option>
                    </select>
                </div>
                {showRawText && (
                    <div className="col-12">
                        <label htmlFor="text" className="form-label">Enter Raw Text</label>
                        <textarea className="form-control" id="text" placeholder="Enter Raw Text" rows="10" value={rawText} onChange={handleRawTextChange} />
                    </div>
                )}
                {showUrl && (
                    <div className="col-12">
                        <label htmlFor="url" className="form-label">Enter URL</label>
                        <input type="url" className="form-control" id="url" placeholder="Enter URL" value={url} onChange={handleUrlChange} />
                    </div>
                )}
                {showPdf && (
                    <div className="col-12">
                        <label htmlFor="pdf" className="form-label">Upload PDF</label>
                        <input className="form-control" type="file" id="pdf" accept="application/pdf" onChange={handlePdfChange} pdfFile={pdfFile}/>
                    </div>
                )}
                <div className="col-12">
                    <button type="submit" className="btn btn-primary">Submit</button>
                </div>
                {
                    showLoader && (<Vortex
                        visible={true}
                        height="80"
                        width="80"
                        ariaLabel="vortex-loading"
                        wrapperStyle={{}}
                        wrapperClass="vortex-wrapper"
                        colors={['red', 'green', 'blue', 'yellow', 'orange', 'purple']}
                    />)
                }
                    </form>
                </div>
            </div>
            <div></div>
            { output!== "" && 
                ( 
                    <div className="card">
                        <h5 className="card-header">Summary</h5>
                        <div className="card-body">
                            <div className="row">{output}</div>
                        </div>
                    </div>
                )  
            }
        </div>

    );
}

export default UserForm;
