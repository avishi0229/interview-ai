const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteerCore = require("puppeteer-core")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const PDF_LAUNCH_ARGS = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-extensions",
    "--font-render-hinting=none"
]


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    atsScore: z.number().describe("A score between 0 and 100 for how ATS-friendly and parseable the uploaded resume is: keyword relevance to the job, clear section headings, standard formatting, measurable achievements, no tables/columns/graphics that break ATS parsers, contact info clarity, and overall scannability"),
    atsFeedback: z.string().describe("A short 1-2 sentence explanation of the ATS score and the top issues or strengths for ATS parsing"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        Also evaluate the uploaded resume for ATS (Applicant Tracking System) friendliness and return atsScore (0-100) plus brief atsFeedback.
                        Score based on: keyword alignment with the job description, clear standard headings, single-column plain layout friendliness, quantifiable bullet points, missing critical sections, and anything that would confuse an ATS parser.
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)


}



function extractResumeBodyHtml(htmlContent) {
    if (!htmlContent) return ""
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    if (bodyMatch) return bodyMatch[1]
    return htmlContent
        .replace(/<!DOCTYPE[^>]*>/i, "")
        .replace(/<\/?(html|head)[^>]*>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
}

function wrapOnePageResumeHtml(htmlContent) {
    const bodyHtml = extractResumeBodyHtml(htmlContent)
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  html, body {
    margin: 0;
    padding: 0;
    width: 210mm;
    height: 297mm;
    overflow: hidden;
    background: #fff;
  }
  #resume-page {
    position: relative;
    width: 210mm;
    height: 297mm;
    padding: 10mm 12mm;
    box-sizing: border-box;
    overflow: hidden;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10pt;
    line-height: 1.25;
    color: #111;
  }
  #resume-scale-inner {
    transform-origin: top left;
  }
  #resume-page h1 { font-size: 16pt; margin: 0 0 4pt; }
  #resume-page h2 {
    font-size: 11pt;
    margin: 8pt 0 4pt;
    padding-bottom: 2pt;
    border-bottom: 1px solid #333;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  #resume-page h3 { font-size: 10.5pt; margin: 4pt 0 2pt; }
  #resume-page p, #resume-page li { margin: 0 0 2.5pt; }
  #resume-page ul { margin: 0 0 4pt; padding-left: 14pt; }
  #resume-page section, #resume-page .section { margin-bottom: 6pt; }
  #resume-page table { width: 100%; border-collapse: collapse; }
  #resume-page * { max-width: 100%; }
</style>
</head>
<body>
  <div id="resume-page"><div id="resume-scale-inner">${bodyHtml}</div></div>
</body>
</html>`
}

async function launchPdfBrowser() {
    const customExecutablePath =
        process.env.CHROMIUM_PATH ||
        process.env.PUPPETEER_EXECUTABLE_PATH

    if (customExecutablePath) {
        return puppeteerCore.launch({
            headless: true,
            executablePath: customExecutablePath,
            args: PDF_LAUNCH_ARGS
        })
    }

    const isProduction = process.env.NODE_ENV === "production"

    if (isProduction) {
        const chromium = require("@sparticuz/chromium")
        chromium.setGraphicsMode = false

        return puppeteerCore.launch({
            args: [ ...chromium.args, ...PDF_LAUNCH_ARGS ],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless
        })
    }

    let puppeteer
    try {
        puppeteer = require("puppeteer")
    } catch {
        throw new Error(
            "PDF generation requires Chromium. Install dev dependencies locally or set CHROMIUM_PATH in production."
        )
    }

    return puppeteer.launch({
        headless: true,
        args: PDF_LAUNCH_ARGS
    })
}

async function generatePdfFromHtml(htmlContent) {
    let browser

    try {
        browser = await launchPdfBrowser()
        const page = await browser.newPage()
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 })
        await page.setContent(wrapOnePageResumeHtml(htmlContent), { waitUntil: "load" })

        // Shrink content so everything fits on a single A4 page
        await page.evaluate(() => {
            const root = document.getElementById("resume-page")
            const inner = document.getElementById("resume-scale-inner")
            if (!root || !inner) return

            const availableHeight = root.clientHeight
            const contentHeight = inner.scrollHeight
            if (contentHeight <= availableHeight) return

            const scale = Math.max(0.55, (availableHeight / contentHeight) * 0.96)
            inner.style.transform = `scale(${scale})`
            inner.style.width = `${100 / scale}%`
        })

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            pageRanges: "1",
            margin: {
                top: "0mm",
                bottom: "0mm",
                left: "0mm",
                right: "0mm"
            }
        })

        return pdfBuffer
    } catch (error) {
        throw new Error(`PDF generation failed: ${error.message || error}`)
    } finally {
        if (browser) {
            await browser.close().catch(() => {})
        }
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML body content of a single-page ATS-friendly resume (sections only, no html/head/body wrappers)")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        CRITICAL: The resume MUST fit on EXACTLY ONE A4 page. Keep content concise: prioritize the most relevant experience, skills, and achievements for this job. Prefer short bullets over long paragraphs. Omit low-value details.
                        Use a simple single-column layout with standard headings (Summary, Skills, Experience, Education, Projects if needed). No multi-column layouts, no tables for layout, no icons, no images, no sidebars.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        Keep design simple and professional. Content must be ATS friendly and easily parsable.
                        Return only inner HTML for the resume body (e.g. headings, paragraphs, lists) — no full HTML document wrapper.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }