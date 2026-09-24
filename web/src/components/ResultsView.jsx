import { Icon } from './Icon.jsx'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'ats', label: 'ATS Check' },
  { id: 'suggestions', label: 'Suggestions' },
  { id: 'keywords', label: 'Keywords' },
]

function ScoreRing({ score }) {
  const value = Math.max(0, Math.min(100, Number(score) || 0))
  return (
    <div className="score-ring" aria-label={`Resume structure score: ${value} out of 100`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="score-ring__track" cx="60" cy="60" r="50" pathLength="100" />
        <circle className="score-ring__value" cx="60" cy="60" r="50" pathLength="100" strokeDasharray={`${value} ${100 - value}`} />
      </svg>
      <div><strong>{value}%</strong><span>Structure score</span></div>
    </div>
  )
}

function QuickStat({ icon, value, label, tone = 'accent' }) {
  return (
    <div className="quick-stat">
      <span className={`quick-stat__icon quick-stat__icon--${tone}`}><Icon name={icon} size={18} /></span>
      <div><strong>{value}</strong><span>{label}</span></div>
    </div>
  )
}

function Breakdown({ sections }) {
  return (
    <section className="result-card breakdown" aria-labelledby="breakdown-title">
      <div className="card-heading"><h2 id="breakdown-title">Section breakdown</h2><span>{sections.length} groups</span></div>
      <div className="score-list">
        {sections.map((section) => (
          <div className="score-row" key={section.category}>
            <div><strong>{section.category}</strong><span>{section.percent}%</span></div>
            <progress max="100" value={section.percent} aria-label={`${section.category}: ${section.percent}%`} />
          </div>
        ))}
      </div>
    </section>
  )
}

function InsightList({ icon, items, title, tone }) {
  return (
    <details className={`insight-card insight-card--${tone}`}>
      <summary>
        <span className="insight-card__title"><span><Icon name={icon} size={17} /></span>{title}</span>
        <span>{items.length} {items.length === 1 ? 'item' : 'items'} <Icon name="chevron" size={16} /></span>
      </summary>
      <ul>
        {items.length ? items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>) : <li>No findings in this group.</li>}
      </ul>
    </details>
  )
}

function EmptyState({ action, body, onAction, title }) {
  return (
    <div className="empty-state">
      <span><Icon name="target" size={23} /></span>
      <div><h2>{title}</h2><p>{body}</p></div>
      {action ? <button className="secondary-button" type="button" onClick={onAction}>{action}</button> : null}
    </div>
  )
}

function OverviewPanel({ analysis, onEdit }) {
  const { candidate, summary } = analysis
  const checks = analysis.ats_checks || []
  const sections = analysis.ats_section_scores || []
  const missingChecks = checks.filter((check) => !check.matched)
  const matchedChecks = checks.filter((check) => check.matched)
  const bulletFindings = analysis.bullet_quality?.flagged_bullets || []
  const jobProvided = Boolean(analysis.job_description?.trim())
  const topFinding = bulletFindings[0]
  const topCheck = missingChecks[0]
  const topSuggestion = topFinding ? {
    title: topFinding.issues?.[0] || 'Strengthen one experience bullet',
    body: topFinding.coaching_tip || topFinding.suggestion,
  } : topCheck ? {
    title: topCheck.label,
    body: topCheck.warning,
  } : !jobProvided ? {
    title: 'Add a target job description',
    body: 'Role-specific evidence and keyword guidance need the responsibilities from a real job post.',
  } : {
    title: 'Review the evidence map',
    body: analysis.requirement_evidence?.summary || 'The current structure checks did not surface a priority issue.',
  }
  const strengths = matchedChecks.map((check) => check.success || check.label).filter(Boolean).slice(0, 4)
  const improvements = missingChecks.map((check) => check.warning || check.label).filter(Boolean).slice(0, 4)
  const suggestions = [
    ...bulletFindings.map((finding) => finding.suggestion),
    ...(summary.recommended_skills || []).map((skill) => `Add evidence for ${skill} only if you can support it.`),
  ].filter(Boolean).slice(0, 4)

  return (
    <div className="overview-panel">
      <div className="overview-topline">
        <section className="result-card score-summary" aria-labelledby="score-title">
          <ScoreRing score={summary.resume_score} />
          <div className="score-summary__copy">
            <p className="context-label" id="score-title">Resume structure</p>
            <h2>{missingChecks.length ? 'A clear editing order.' : 'Core sections are present.'}</h2>
            <p>{summary.match_reason}</p>
            {summary.semantic_match_score == null ? <span>Role similarity unavailable</span> : <span>{summary.semantic_match_score}% role similarity</span>}
          </div>
        </section>
        <section className="result-card quick-stats" aria-labelledby="quick-stats-title">
          <h2 id="quick-stats-title">Quick facts</h2>
          <QuickStat icon="file" value={candidate.page_count} label={candidate.page_count === 1 ? 'page' : 'pages'} />
          <QuickStat icon="layers" value={checks.length} label="structure checks" tone="success" />
          <QuickStat icon="alert" value={missingChecks.length} label="unmet checks" tone={missingChecks.length ? 'warning' : 'success'} />
        </section>
      </div>

      <div className="overview-middle">
        <Breakdown sections={sections} />
        <aside className="top-suggestion" aria-labelledby="top-suggestion-title">
          <span><Icon name="spark" size={23} /></span>
          <div><p>Start here</p><h2 id="top-suggestion-title">{topSuggestion.title}</h2><p>{topSuggestion.body}</p></div>
        </aside>
      </div>

      <div className="insight-grid">
        <InsightList icon="check" items={strengths} title="Strengths" tone="success" />
        <InsightList icon="alert" items={improvements} title="Areas to improve" tone="warning" />
        <InsightList icon="spark" items={suggestions} title="Suggested edits" tone="accent" />
      </div>

      {!jobProvided ? (
        <div className="role-callout">
          <div><Icon name="target" size={24} /><span><strong>Want role-specific guidance?</strong><small>Add a job description to unlock evidence and keyword matching.</small></span></div>
          <button className="secondary-button" type="button" onClick={onEdit}>Add job description</button>
        </div>
      ) : null}
    </div>
  )
}

function AtsPanel({ analysis }) {
  const checks = analysis.ats_checks || []
  const sections = analysis.ats_section_scores || []
  return (
    <div className="detail-panel">
      <div className="detail-panel__intro"><div><p className="context-label">Structure checks</p><h2>What the parser found</h2></div><p>These checks cover expected resume sections and positioning cues. They are not an employer ATS verdict.</p></div>
      <Breakdown sections={sections} />
      <section className="check-list" aria-label="Detailed structure checks">
        {checks.map((check) => (
          <article className={check.matched ? 'check-row check-row--pass' : 'check-row check-row--warn'} key={check.label}>
            <span><Icon name={check.matched ? 'check' : 'alert'} size={17} /></span>
            <div><h3>{check.label}</h3><p>{check.matched ? check.success : check.warning}</p></div>
            <strong>{check.weight} pts</strong>
          </article>
        ))}
      </section>
    </div>
  )
}

function SuggestionsPanel({ analysis }) {
  const findings = analysis.bullet_quality?.flagged_bullets || []
  const recommended = analysis.summary?.recommended_skills || []
  if (!findings.length && !recommended.length) return <EmptyState title="No editing suggestions yet" body="The current parser did not recover a specific bullet or skill suggestion from this document." />
  return (
    <div className="detail-panel">
      <div className="detail-panel__intro"><div><p className="context-label">Evidence-first edits</p><h2>Revise without inventing claims</h2></div><p>Suggested rewrites are prompts for your own facts. Replace generic wording only with outcomes you can verify.</p></div>
      <div className="suggestion-list">
        {findings.map((finding, index) => (
          <article className="suggestion-card" key={`${finding.original}-${index}`}>
            <div className="suggestion-card__index">{String(index + 1).padStart(2, '0')}</div>
            <div><p className="suggestion-card__label">Source bullet</p><h3>{finding.original}</h3><p className="suggestion-card__label">Editing direction</p><p>{finding.suggestion}</p><small>{finding.issues.join(' · ')}</small></div>
          </article>
        ))}
      </div>
      {recommended.length ? (
        <section className="recommended-skills"><h2>Role-direction signals</h2><p>Only add these when your projects or work history can prove them.</p><div>{recommended.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
      ) : null}
    </div>
  )
}

function KeywordsPanel({ analysis, onEdit }) {
  const jobProvided = Boolean(analysis.job_description?.trim())
  if (!jobProvided) return <EmptyState action="Add job description" body="Paste the responsibilities and requirements from a real job post. Your PDF does not need to be uploaded again." onAction={onEdit} title="Keyword matching needs a target role" />
  const requirements = analysis.requirement_evidence?.requirements || []
  const missingByGroup = analysis.gap_explainer?.categorized_missing_keywords || {}
  return (
    <div className="detail-panel">
      <div className="detail-panel__intro"><div><p className="context-label">Requirement evidence</p><h2>Keywords with context</h2></div><p>{analysis.requirement_evidence?.summary}</p></div>
      <section className="evidence-list" aria-label="Role requirement evidence">
        {requirements.map((item) => (
          <article className={item.status === 'Matched' ? 'evidence-row evidence-row--match' : 'evidence-row evidence-row--missing'} key={item.requirement}>
            <span><Icon name={item.status === 'Matched' ? 'check' : 'alert'} size={17} /></span>
            <div><h3>{item.requirement}</h3><p>{item.evidence || 'No supporting line was found in the parsed resume.'}</p></div>
            <strong>{item.status}</strong>
          </article>
        ))}
      </section>
      {Object.keys(missingByGroup).length ? (
        <section className="gap-groups"><h2>Missing signals by type</h2><div>{Object.entries(missingByGroup).map(([group, items]) => <article key={group}><h3>{group}</h3><p>{items.join(' · ')}</p></article>)}</div></section>
      ) : null}
    </div>
  )
}

function PdfPreview({ file, previewUrl }) {
  return (
    <aside className="pdf-panel" aria-label="Selected resume preview">
      <div className="pdf-panel__heading"><span>Document preview</span><a href={previewUrl} target="_blank" rel="noreferrer">Open PDF <Icon name="external" size={15} /></a></div>
      <object className="pdf-object" data={`${previewUrl}#toolbar=1&navpanes=0`} type="application/pdf" title={`Preview of ${file.name}`}>
        <p>Preview unavailable. <a href={previewUrl} target="_blank" rel="noreferrer">Open the PDF in a new tab.</a></p>
      </object>
      <a className="pdf-mobile-link" href={previewUrl} target="_blank" rel="noreferrer"><Icon name="file" size={20} /> Open the selected PDF <Icon name="external" size={16} /></a>
    </aside>
  )
}

export default function ResultsView({
  activeTab,
  analysis,
  file,
  headingRef,
  onDownload,
  onEdit,
  onReplace,
  onTabChange,
  previewUrl,
  reportError,
  reportStage,
}) {
  const handleTabKeyDown = (event, index) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    let nextIndex = index
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    onTabChange(tabs[nextIndex].id)
    event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')[nextIndex]?.focus()
  }

  return (
    <section className="results-view" aria-labelledby="results-title">
      <h1 className="visually-hidden" id="results-title" ref={headingRef} tabIndex="-1">Resume analysis results</h1>
      <div className="results-filebar">
        <div className="file-identity"><span><Icon name="file" size={22} /></span><div><strong>{file.name}</strong><small>PDF · {Math.ceil(file.size / 1024).toLocaleString()} KB · analyzed this session</small></div></div>
        <div className="results-filebar__actions">
          <button className="text-button" type="button" onClick={onEdit}>Edit inputs</button>
          <button className="secondary-button" type="button" onClick={onReplace}><Icon name="replace" size={17} /> Replace PDF</button>
          <button className="primary-button report-button" type="button" onClick={onDownload} disabled={reportStage === 'downloading'}><Icon name="download" size={17} />{reportStage === 'downloading' ? 'Preparing report' : 'Download report'}</button>
        </div>
      </div>
      <div className="report-status" aria-live="polite">{reportError ? <p className="message message--error"><Icon name="alert" size={17} />{reportError}</p> : null}</div>

      <div className="results-workbench">
        <PdfPreview file={file} previewUrl={previewUrl} />
        <div className="results-content">
          <div className="result-tabs" role="tablist" aria-label="Analysis sections">
            {tabs.map((tab, index) => (
              <button id={`tab-${tab.id}`} className={activeTab === tab.id ? 'result-tab result-tab--active' : 'result-tab'} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`} tabIndex={activeTab === tab.id ? 0 : -1} onClick={() => onTabChange(tab.id)} onKeyDown={(event) => handleTabKeyDown(event, index)} key={tab.id}>{tab.label}</button>
            ))}
          </div>
          <div className="result-tabpanel" id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex="0">
            {activeTab === 'overview' ? <OverviewPanel analysis={analysis} onEdit={onEdit} /> : null}
            {activeTab === 'ats' ? <AtsPanel analysis={analysis} /> : null}
            {activeTab === 'suggestions' ? <SuggestionsPanel analysis={analysis} /> : null}
            {activeTab === 'keywords' ? <KeywordsPanel analysis={analysis} onEdit={onEdit} /> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
