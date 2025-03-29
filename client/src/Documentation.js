import React, { useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import flipAudio from "./AUDIO-2025-02-07-17-56-20.mp3";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Page Component
const Pages = React.forwardRef((props, ref) => (
  <div className="demoPage" ref={ref}>
    {props.children}
  </div>
));

Pages.displayName = "Pages";

export default function Documentation({ file }) {
  const flipSound = new Audio(flipAudio);
  const flipbookRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [matches, setMatches] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [processedFile, setProcessedFile] = useState(null);

  function getPreviewLink(originalLink) {
    const match = originalLink.match(/(?:\/d\/|id=)([\w-]+)/);
    if (match) {
      const fileId = match[1];
      if (originalLink.includes("docs.google.com/document")) {
        return `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
      } else if (originalLink.includes("docs.google.com/spreadsheets")) {
        return `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`;
      } else if (originalLink.includes("docs.google.com/presentation")) {
        return `https://docs.google.com/presentation/d/${fileId}/export/pdf`;
      } else {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    return originalLink;
  }

  useEffect(() => {
    if (file) {
      setProcessedFile(getPreviewLink(file));
    }
  }, [file]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    extractText();
  }

  const extractText = useCallback(async () => {
    if (!processedFile) return;
    const loadingTask = pdfjs.getDocument(processedFile);
    const pdf = await loadingTask.promise;
    let extractedMatches = [];
  
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const lines = textContent.items.map((item) => item.str);
      const pageText = lines.join(" ");
  
      if (searchQuery) {
        const regex = new RegExp(searchQuery, "gi");
        let foundMatches = [...pageText.matchAll(regex)]; // Get all matches first
  
        let uniqueLines = new Set();
        foundMatches.forEach((match) => {
          lines.forEach((line) => {
            if (line.includes(match[0])) uniqueLines.add(line);
          });
        });
  
        uniqueLines.forEach((line) => {
          extractedMatches.push({ text: line, page: i });
        });
      }
    }
    setMatches(extractedMatches);
  }, [processedFile, searchQuery]);
  
  useEffect(() => {
    extractText();
  }, [extractText]);

  function handleFlip(event) {
    flipSound.play().catch((e) => console.error("Audio play error:", e));
    setCurrentPage(event.data + 1);
  }

  const flipToNextPage = () => {
    if (currentPage < numPages) {
      flipbookRef.current.pageFlip().flipNext(["top"]);
      setCurrentPage(currentPage + 1);
    }
  };

  const flipToPrevPage = () => {
    if (currentPage > 1) {
      flipbookRef.current.pageFlip().flipPrev(["top"]);
      setCurrentPage(currentPage - 1);
    }
  };

  const flipToPage = (pageNumber) => {
    if (flipbookRef.current) {
      flipbookRef.current.pageFlip().turnToPage(pageNumber - 1);
      setCurrentPage(pageNumber);
    }
  };

  const [dimensions, setDimensions] = useState({ width: 500, height: 707 });

  useEffect(() => {
    function updateDimensions() {
      const screenWidth = window.innerWidth;
      if (screenWidth > 800) {
        setDimensions({ width: 500, height: 707 });
      } else {
        const responsiveWidth = screenWidth * 0.9;
        const responsiveHeight = responsiveWidth * 1.414;
        setDimensions({ width: responsiveWidth, height: responsiveHeight });
      }
    }
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div className="flipbook-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search in PDF..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && matches.length > 0 && (
          <div className="matches" style={{color: 'black'}}>
            {matches.length} Matches Found
            <ul className="match-list">
              {matches.map((match, index) => (
                <li key={index} onClick={() => flipToPage(match.page)}>
                  <strong>Page {match.page}:</strong> {match.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {processedFile ? (
        <div className="view-download">
          <Document file={processedFile} onLoadSuccess={onDocumentLoadSuccess}>
            {numPages && (
              <>
                <HTMLFlipBook
                  ref={flipbookRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  showCover={false}
                  mobileScrollSupport={true}
                  onFlip={handleFlip}
                  className="flipbook"
                >
                  {[...Array(numPages).keys()].map((pNum) => (
                    <Pages key={pNum} number={pNum + 1}>
                      <Page
                        pageNumber={pNum + 1}
                        width={dimensions.width}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                      />
                    </Pages>
                  ))}
                </HTMLFlipBook>

                <div className="page-indicator">
                  Page {currentPage} / {numPages}
                </div>
              </>
            )}
          </Document>

          <div className="page-navigation">
            <button className="btn" onClick={flipToPrevPage} disabled={currentPage === 1}>
              Prev Page
            </button>
            <button className="btn" onClick={flipToNextPage} disabled={currentPage === numPages}>
              Next Page
            </button>
          </div>
        </div>
      ) : (
        <h3>No Document Selected</h3>
      )}
    </div>
  );
}
