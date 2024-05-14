import { useState } from 'react';
import axios from 'axios';
import './form.css';
import { Vortex } from 'react-loader-spinner';

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
    // const [number,setNumber] = useState(10);
    const [showLoader, setShowLoader] = useState(false);
    const [error, setError] = useState({ rawText: '', url: '', pdfFile: '' ,summaryWord:''});
    const [showOverlay, setShowOverlay] = useState(false);
    const handleChangeType = (event) => {
        const val = event.target.value;
        setType(val);
        setOutput("");
    };

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
        setError({ rawText: '', url: '', pdfFile: '' });
    };

    const validateRawText = (text) => {
        if (!text.trim()) {
            setError(prev => ({ ...prev, rawText: 'Raw text cannot be empty.' }));
            return false;
        }
        setError(prev => ({ ...prev, rawText: '' }));
        return true;
    };

    const validateUrl = (url) => {
        if (!url.trim()) {
            setError(prev => ({ ...prev, url: 'URL cannot be empty.' }));
            return false;
        }
        const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        if (!urlPattern.test(url)) {
            setError(prev => ({ ...prev, url: 'Invalid URL.' }));
            return false;
        }
        setError(prev => ({ ...prev, url: '' }));
        return true;
    };

    const validatePdf = (file) => {
        if (!file) {
            setError(prev => ({ ...prev, pdfFile: 'Please select a PDF file.' }));
            return false;
        }
        setError(prev => ({ ...prev, pdfFile: '' }));
        return true;
    };

    const handleRawTextChange = (event) => {
        setRawText(event.target.value);
        validateRawText(event.target.value);
        setOutput("");
    };

    const handleUrlChange = (event) => {
        setUrl(event.target.value);
        validateUrl(event.target.value);
        setOutput("");
    };

    const handlePdfChange = (event) => {
        const file = event.target.files[0];
        setPdfFile(file);
        validatePdf(file);
        setOutput("");
    };

    // const handleSummaryWordChange=(event)=>{
    //     setNumber(event.target.value);
    //     setOutput("");
    // }

    const handleSubmit = (event) => {
        event.preventDefault();
        let isValid = true;
        setOutput("")
        // Validation
        if (showRawText) isValid = validateRawText(rawText);
        if (showUrl) isValid = validateUrl(url);
        if (showPdf) isValid = validatePdf(pdfFile);

        if (!isValid) return;  // Stop submission if validation fails

        const formData = new FormData();
        formData.append('type', type);
        formData.append('source', source);
        // formData.append('number', number);
        if (showRawText) formData.append('text', rawText);
        if (showUrl) formData.append('url', url);
        if (showPdf && pdfFile) formData.append('file', pdfFile);

        setShowLoader(true);
        setShowOverlay(true);
        axios.post('http://localhost:5000/runscript', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(response => {
            setShowLoader(false);
            setShowOverlay(false);
            setOutput(response.data.output);
        }).catch(err => {
            setShowLoader(false);
            setShowOverlay(false);
            console.error('API call error:', err);
        });
    };

    return (
        <div className="h-100 align-items-center justify-content-center">
            {showOverlay && <div className="overlay"></div>} {/* Render overlay */}
            <div className="card">
                <div className="card-body">
                    <form className="row g-3" onSubmit={handleSubmit}>
                        <div className="col-md-6">
                            <label htmlFor="type" className="form-label">Type</label>
                            <select id="type" value={type} className="form-select" onChange={handleChangeType}>
                                <option value="1">Extractive</option>
                                <option value="2">Abstractive</option>
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
                        {/* <div className="col-md-6">
                        <label htmlFor="summary_word" className="form-label">No of words(in summary)</label>
                                <input type="number" className="form-control" id="summary_word" placeholder="10" min="10" value={number} onChange={handleSummaryWordChange} />
                                {error.summaryWord && <div className="text-danger">{error.summaryWord}</div>}
                        </div> */}

                        {showRawText && (
                            <div className="col-12">
                                <label htmlFor="text" className="form-label">Enter Raw Text</label>
                                <textarea className="form-control" id="text" placeholder="Enter Raw Text" rows="10" value={rawText} onChange={handleRawTextChange} />
                                {error.rawText && <div className="text-danger">{error.rawText}</div>}
                            </div>
                        )}
                        {showUrl && (
                            <div className="col-12">
                                <label htmlFor="url" className="form-label">Enter URL</label>
                                <input type="url" className="form-control" id="url" placeholder="Enter URL" value={url} onChange={handleUrlChange} />
                                {error.url && <div className="text-danger">{error.url}</div>}
                            </div>
                        )}
                        {showPdf && (
                            <div className="col-12">
                                <label htmlFor="pdf" className="form-label">Upload PDF</label>
                                <input className="form-control" type="file" id="pdf" accept="application/pdf" onChange={handlePdfChange} />
                                {error.pdfFile && <div className="text-danger">{error.pdfFile}</div>}
                            </div>
                        )}
                        <div className="col-12">
                            <button type="submit" className="btn btn-primary">Summarize Text</button>
                        </div>
                        {showLoader && (
                            <Vortex
                                visible={true}
                                height="80"
                                width="80"
                                ariaLabel="vortex-loading"
                                wrapperStyle={{}}
                                wrapperClass="vortex-wrapper"
                                colors={['red', 'green', 'blue', 'yellow', 'orange', 'purple']}
                            />
                        )}
                    </form>
                </div>
            </div>
            <div></div>
            {output !== "" && (
                <div className="card">
                    <h5 className="card-header">Summary</h5>
                    <div className="card-body">
                        <div className="row">{output}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserForm;
