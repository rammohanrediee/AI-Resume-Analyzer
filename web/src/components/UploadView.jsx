import { useState } from 'react'
import { Icon, ResumeIllustration } from './Icon.jsx'

const benefits = [
  { icon: 'layers', title: 'Section checks', body: 'See which expected resume sections are present and which need work.' },
  { icon: 'target', title: 'Role evidence', body: 'Compare the resume with a target role when you add its job description.' },
  { icon: 'chart', title: 'Actionable edits', body: 'Review missing evidence and weak bullets without invented claims.' },
]

const process = [
  { icon: 'file', title: 'Read the document', body: 'Extract text from a PDF, with bounded OCR when a page needs it.' },
  { icon: 'layers', title: 'Separate the scores', body: 'Resume structure and role similarity stay clearly labelled.' },
  { icon: 'spark', title: 'Prioritize the next edit', body: 'Surface checks, evidence gaps, and bullet guidance from real analysis data.' },
]

export default function UploadView({
  analysisExists,
  busy,
  candidateName,
  error,
  file,
  inputRef,
  jobDescription,
  onCandidateChange,
  onFileSelect,
  onJobChange,
  onReset,
  onSubmit,
  serviceStatus,
  stageMessage,
}) {
  const [dragging, setDragging] = useState(false)
  const jobInvalid = jobDescription.trim().length > 0 && jobDescription.trim().length < 30

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    if (busy) return
    onFileSelect(event.dataTransfer.files?.[0] || null)
  }

  return (
    <section className="upload-view" aria-labelledby="upload-title">
      <form className="upload-workbench" onSubmit={onSubmit} noValidate aria-busy={busy}>
        <div className="upload-intro">
          <p className="context-label"><Icon name="spark" size={17} /> Evidence-based resume review</p>
          <h1 id="upload-title">Upload your resume.</h1>
          <p className="upload-intro__lede">Check its structure, compare it with a target role, and leave with a specific editing order.</p>
        </div>

        <div className="upload-action">
          <div
            className={`drop-zone${file ? ' drop-zone--filled' : ''}${dragging ? ' drop-zone--dragging' : ''}`}
            onDragEnter={(event) => { event.preventDefault(); if (!busy) setDragging(true) }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false) }}
            onDrop={handleDrop}
          >
            <input ref={inputRef} className="visually-hidden" id="resume-file" type="file" accept="application/pdf,.pdf" onChange={(event) => onFileSelect(event.target.files?.[0] || null)} disabled={busy} />
            <span className="drop-zone__icon"><Icon name={file ? 'file' : 'upload'} size={30} /></span>
            <div className="drop-zone__copy">
              <strong>{file ? file.name : 'Drop your resume here'}</strong>
              <span>{file ? `${Math.ceil(file.size / 1024).toLocaleString()} KB · PDF selected` : 'or choose a PDF from this device'}</span>
            </div>
            <label className="primary-button drop-zone__button" htmlFor="resume-file">
              <Icon name={file ? 'replace' : 'upload'} size={19} />
              {file ? 'Replace PDF' : 'Choose PDF'}
            </label>
            <small>PDF only · Up to 5 MiB · Up to 20 pages</small>
          </div>

          <p className="privacy-line"><Icon name="shield" size={18} /> The document is processed for this session and is not stored by the upload endpoint.</p>

          <details className="analysis-context" open={Boolean(jobDescription || candidateName)}>
            <summary>
              <span>Add target-role context <small>Optional</small></span>
              <Icon name="chevron" size={18} />
            </summary>
            <div className="analysis-context__fields">
              <div className="field-group">
                <div className="label-row"><label htmlFor="job-description">Target job description</label><span>{jobDescription.length.toLocaleString()} characters</span></div>
                <textarea id="job-description" value={jobDescription} onChange={(event) => onJobChange(event.target.value)} rows="7" maxLength="20000" placeholder="Paste the role responsibilities and requirements." aria-describedby="job-help" aria-invalid={jobInvalid} disabled={busy} />
                <small className="field-help" id="job-help">Leave blank for a resume-only review. Use at least 30 characters for role matching.</small>
              </div>
              <div className="field-group">
                <label htmlFor="candidate-name">Analysis label <span>Optional</span></label>
                <input id="candidate-name" type="text" value={candidateName} onChange={(event) => onCandidateChange(event.target.value)} maxLength="120" autoComplete="name" placeholder="Candidate name" disabled={busy} />
              </div>
            </div>
          </details>
        </div>

        <section className="benefit-list" aria-labelledby="benefits-title">
          <h2 id="benefits-title">What the review covers</h2>
          {benefits.map((benefit) => (
            <article className="benefit" key={benefit.title}>
              <span className="icon-tile"><Icon name={benefit.icon} /></span>
              <div><h3>{benefit.title}</h3><p>{benefit.body}</p></div>
            </article>
          ))}
        </section>

        <aside className="upload-explainer" aria-label="How the analysis works">
          <ResumeIllustration />
          <div className="process-list">
            {process.map((item) => (
              <div className="process-item" key={item.title}>
                <span><Icon name={item.icon} size={18} /></span>
                <div><strong>{item.title}</strong><p>{item.body}</p></div>
              </div>
            ))}
          </div>
        </aside>

        <div className="upload-footer">
          <div className="form-status" aria-live="polite">
            {error ? <p className="message message--error"><Icon name="alert" size={18} /><span><strong>Analysis stopped.</strong> {error}</span></p> : null}
            {busy ? <p className="message message--loading"><Icon name="spark" size={18} />{stageMessage}</p> : null}
            {serviceStatus === 'offline' ? <p className="message message--error"><Icon name="alert" size={18} /><span><strong>Service offline.</strong> Start the FastAPI backend on port 8001, then refresh.</span></p> : null}
          </div>
          <div className="upload-footer__actions">
            {analysisExists ? <button className="text-button" type="button" onClick={onReset} disabled={busy}>Reset session</button> : null}
            <button className="primary-button analyze-button" type="submit" disabled={!file || busy || serviceStatus === 'offline'} data-loading={busy || undefined}>
              {busy ? stageMessage : analysisExists ? 'Re-analyze resume' : 'Analyze resume'}
              {!busy ? <Icon name="arrow" size={19} /> : null}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}
