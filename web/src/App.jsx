import { useRef, useState } from 'react'
import { analyzeResume, downloadReport, extractResume } from './api'
import './App.css'

const MAX_PDF_BYTES = 5 * 1024 * 1024

function ScoreRing({ score }) {
  return (
    <div className="score-ring" style={{ '--score': `${score * 3.6}deg` }} aria-label={`Resume score ${score} out of 100`}>
      <span>{score}</span>
      <small>/ 100</small>
    </div>
  )
}

function Results({ analysis, onDownload, downloading }) {
  const { candidate, summary, ats_section_scores: sections, requirement_evidence: evidence, gap_explainer: gaps } = analysis
  const missing = Object.entries(gaps.categorized_missing_keywords || {})

  return (
    <section className="results" aria-labelledby="results-title">
      <div className="results-heading">
        <div>
          <p className="eyebrow">Analysis complete</p>
          <h2 id="results-title">Your fit for {summary.role_title}</h2>
          <p>{summary.match_reason}</p>
        </div>
        <ScoreRing score={summary.resume_score} />
      </div>

      <div className="result-grid">
        <article className="panel evidence-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Job alignment</p><h3>Requirement evidence</h3></div>
            <strong>{evidence.coverage_percent}% covered</strong>
          </div>
          {evidence.requirements.length ? (
            <ul className="evidence-list">
              {evidence.requirements.map((item) => (
                <li key={item.requirement}>
                  <span className={`status-dot ${item.status === 'Matched' ? 'matched' : ''}`} aria-hidden="true" />
                  <div><strong>{item.requirement}</strong><p>{item.evidence || 'No supporting evidence found in the resume.'}</p></div>
                  <span className="status-label">{item.status}</span>
                </li>
              ))}
            </ul>
          ) : <p className="empty-state">Add a more detailed job description to map requirements.</p>}
        </article>

        <article className="panel">
          <p className="eyebrow">ATS readiness</p><h3>Section strength</h3>
          <div className="section-bars">
            {sections.map((section) => (
              <div key={section.category}>
                <div className="bar-label"><span>{section.category}</span><strong>{section.percent}%</strong></div>
                <div className="bar-track"><span style={{ width: `${section.percent}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Skills detected</p><h3>{candidate.skills.length} relevant signals</h3>
          <div className="chips">{candidate.skills.slice(0, 14).map((skill) => <span key={skill}>{skill}</span>)}</div>
        </article>

        <article className="panel">
          <p className="eyebrow">Missing from your resume</p><h3>Priority gaps</h3>
          {missing.length ? missing.map(([category, items]) => (
            <div className="gap-row" key={category}><strong>{category}</strong><p>{items.join(' · ')}</p></div>
          )) : <p className="empty-state">No major keyword gaps surfaced.</p>}
        </article>
      </div>

      <div className="result-actions">
        <p>Review the evidence before changing your resume. Keep every claim truthful.</p>
        <button className="secondary-button" type="button" onClick={onDownload} disabled={downloading}>
          {downloading ? 'Preparing report…' : 'Download PDF report'}
        </button>
      </div>
    </section>
  )
}

function App() {
  const [file, setFile] = useState(null)
  const [candidateName, setCandidateName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [reportPayload, setReportPayload] = useState(null)
  const [error, setError] = useState('')
  const [stage, setStage] = useState('idle')
  const [downloading, setDownloading] = useState(false)
  const fileInput = useRef(null)
  const filePicker = useRef(null)

  function chooseFile(selectedFile) {
    setError('')
    setAnalysis(null)
    if (!selectedFile) { setFile(null); return }
    if (selectedFile.type !== 'application/pdf') {
      setFile(null)
      setError('Choose a PDF resume.')
      return
    }
    if (selectedFile.size > MAX_PDF_BYTES) {
      setFile(null)
      setError('The resume PDF must be 5 MiB or smaller.')
      return
    }
    setFile(selectedFile)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setAnalysis(null)
    if (!file) {
      setError('Choose your resume PDF first.')
      filePicker.current?.focus()
      return
    }
    if (jobDescription.trim().length < 30) {
      setError('Add at least 30 characters from the target job description.')
      return
    }

    try {
      setStage('extracting')
      const extraction = await extractResume(file)
      const payload = {
        candidate_name: candidateName.trim() || 'Candidate',
        resume_text: extraction.text,
        resume_skills: [],
        job_description: jobDescription.trim(),
        page_count: extraction.page_count,
      }
      setStage('analyzing')
      const result = await analyzeResume(payload)
      setReportPayload(payload)
      setAnalysis(result)
      setStage('complete')
    } catch (requestError) {
      setError(requestError.message)
      setStage('idle')
    }
  }

  async function handleDownload() {
    if (!reportPayload) return
    setDownloading(true)
    setError('')
    try {
      const report = await downloadReport(reportPayload)
      const url = URL.createObjectURL(report)
      const link = document.createElement('a')
      link.href = url
      link.download = 'resume-analysis-report.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDownloading(false)
    }
  }

  const busy = stage === 'extracting' || stage === 'analyzing'

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Resume Lens home"><span>RL</span> Resume Lens</a>
        <p>Private by design · Evidence over guesswork</p>
      </header>

      <main id="top">
        <section className="hero-copy">
          <p className="eyebrow">Resume intelligence for focused applications</p>
          <h1>See what your resume proves.<br /><em>Fix what it doesn’t.</em></h1>
          <p className="lede">Upload one resume and paste the role you want. Get ATS section scores, requirement evidence, skill gaps, and a report you can act on.</p>
        </section>

        <section className="workspace" aria-labelledby="workspace-title">
          <div className="workspace-intro">
            <span>01</span>
            <div><h2 id="workspace-title">Compare your application</h2><p>Your file is processed for this analysis and is not stored by the upload endpoint.</p></div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="field-group">
                <label htmlFor="candidate-name">Your name <span>Optional</span></label>
                <input id="candidate-name" value={candidateName} onChange={(event) => setCandidateName(event.target.value)} maxLength="120" placeholder="Ramu Reddy" />
              </div>

              <div className="field-group file-field">
                <label htmlFor="resume-file">Resume PDF</label>
                <input ref={fileInput} id="resume-file" type="file" accept="application/pdf,.pdf" onChange={(event) => chooseFile(event.target.files[0])} />
                <button ref={filePicker} className="file-picker" type="button" onClick={() => fileInput.current?.click()}>
                  <span className="file-icon" aria-hidden="true">PDF</span>
                  <span><strong>{file ? file.name : 'Choose your resume'}</strong><small>{file ? `${(file.size / 1024).toFixed(0)} KB selected` : 'PDF only · Up to 5 MiB · 20 pages'}</small></span>
                  <span className="browse-label">Browse</span>
                </button>
              </div>

              <div className="field-group job-field">
                <label htmlFor="job-description">Target job description <span>{jobDescription.length.toLocaleString()} characters</span></label>
                <textarea id="job-description" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} maxLength="20000" rows="9" placeholder="Paste the responsibilities and requirements from the job post…" />
              </div>
            </div>

            <div className="form-footer">
              <div className="status-message" role="status" aria-live="polite">
                {error && <span className="error-message">{error}</span>}
                {!error && busy && <span>{stage === 'extracting' ? 'Reading the resume securely…' : 'Mapping evidence to the role…'}</span>}
                {!error && stage === 'complete' && <span>Analysis ready below.</span>}
              </div>
              <button className="primary-button" type="submit" disabled={busy}>
                {busy ? 'Analyzing…' : 'Analyze application'} <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </section>

        {analysis && <Results analysis={analysis} onDownload={handleDownload} downloading={downloading} />}
      </main>

      <footer><span>Resume Lens</span><p>Use the evidence to improve truthful claims. Your resume remains yours.</p></footer>
    </div>
  )
}

export default App
