import { useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Captures the entire results page and exports as a PDF.
 * Pass `targetId` — the id of the div to capture (default: 'results-root').
 */
export default function PDFExportButton({ city, targetId = 'results-root' }) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const element = document.getElementById(targetId)
      if (!element) throw new Error('Target element not found')

      const canvas = await html2canvas(element, {
        scale: 1.5,           // crisp but not enormous
        useCORS: true,        // allow GEE tile images
        backgroundColor: '#0a0a0f',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.85)
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const pageW  = pdf.internal.pageSize.getWidth()
      const pageH  = pdf.internal.pageSize.getHeight()
      const imgW   = pageW
      const imgH   = (canvas.height * pageW) / canvas.width

      // ── multi-page support ────────────────────────────────────────────────
      let yOffset = 0
      while (yOffset < imgH) {
        if (yOffset > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, -yOffset, imgW, imgH)
        yOffset += pageH
      }

      pdf.save(`UHI_Report_${city}_${new Date().getFullYear()}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="btn-heat"
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         8,
        padding:     '10px 20px',
        fontSize:    13,
        cursor:      exporting ? 'wait' : 'pointer',
        opacity:     exporting ? 0.7 : 1,
        transition:  'opacity 0.2s',
      }}
    >
      {exporting ? (
        <>
          <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>
            ⟳
          </span>
          GENERATING PDF...
        </>
      ) : (
        <>📄 EXPORT PDF REPORT</>
      )}
    </button>
  )
}