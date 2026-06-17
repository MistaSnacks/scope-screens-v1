# scripts/build-cms-guide.py
# Generates the one-page Scope Screenings CMS editor guide as a .docx,
# styled with the site brand (Aachen Bold headings, Libre Franklin body).
import os
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

RUST = RGBColor(0xB1, 0x3A, 0x2A)
INK = RGBColor(0x14, 0x12, 0x10)

def style_run(r, font="Libre Franklin", size=10.5, bold=False, color=INK):
    r.font.name = font; r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color

def heading(doc, text):
    p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(8)
    style_run(p.add_run(text), font="Aachen Bold", size=13, color=RUST)

def bullet(doc, text, label=None):
    p = doc.add_paragraph(style="List Bullet")
    if label:
        style_run(p.add_run(label + ": "), bold=True)
    style_run(p.add_run(text))

def main():
    doc = Document()
    for s in doc.sections:
        s.top_margin = s.bottom_margin = Inches(0.5)
        s.left_margin = s.right_margin = Inches(0.7)

    # Header: logo + title
    logo_path = os.path.join(_ROOT, "public/popcorn-logo.png")
    doc.add_picture(logo_path, height=Inches(0.55))
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    h = doc.add_paragraph(); h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    style_run(h.add_run("Editing Your Website Content"), font="Aachen Bold", size=22, color=RUST)
    sub = doc.add_paragraph(); sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    style_run(sub.add_run("A 1-page guide to the Scope Screenings CMS"), size=11)

    heading(doc, "The one rule")
    body = doc.add_paragraph()
    style_run(body.add_run("Open the CMS in your Wix dashboard → pick the collection → edit the fields → click Publish. Your live site updates within the hour."))

    heading(doc, "Sections — edit any section's words, title, image, or button")
    bullet(doc, "the big heading for that section.", "Title")
    bullet(doc, "the small label above the title (e.g. \"Chapter Three\").", "Eyebrow")
    bullet(doc, "the paragraph text.", "Body")
    bullet(doc, "upload a new photo for that section.", "Image")
    bullet(doc, "the button text and where it links (e.g. the Submit button → FilmFreeway).", "Button label / Button link")
    bullet(doc, "leave this alone — it tells the website which section this is.", "Section key")

    heading(doc, "Partners — add or change sponsors")
    bullet(doc, "Add a row for a new partner: name, logo (upload), link, and order. Remove a row to drop a partner.")

    heading(doc, "Marquee — the scrolling banner under the hero")
    bullet(doc, "Each row is one phrase. The \"Now Showing\" date is automatic from your ticketing — you don't edit that.")

    heading(doc, "Socials & Settings")
    bullet(doc, "Socials: add/edit the Instagram, TikTok, YouTube links in the footer.")
    bullet(doc, "Settings: contact email, venue name/address, door & screening times, newsletter heading, footer tagline, copyright.")

    heading(doc, "Leave these alone (they update themselves)")
    bullet(doc, "Tickets and the Schedule come straight from Wix Events — manage those where you already sell tickets.")

    output_path = os.path.join(_ROOT, "docs/Scope-Screenings-CMS-Guide.docx")
    doc.save(output_path)
    print(f"wrote {output_path}")

if __name__ == "__main__":
    main()
