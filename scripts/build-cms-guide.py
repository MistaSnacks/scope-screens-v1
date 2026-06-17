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
    style_run(body.add_run("Open the CMS in your Wix dashboard → pick the collection for the part of the page you want to change → edit the fields → click Publish. Your live site updates within the hour."))

    heading(doc, "How it's organized")
    body2 = doc.add_paragraph()
    style_run(body2.add_run("Every part of the page is its own collection, named after the section. A section's form holds its words & images; its matching \"— List\" collections hold repeating rows. They sit next to each other in the sidebar."))

    heading(doc, "Section forms — open and edit the fields")
    bullet(doc, "eyebrow, title (wordmark), tagline, poster image, video.", "Hero")
    bullet(doc, "eyebrow, title, body, motto quote.", "WhatIs")
    bullet(doc, "heading, founder quote, founder name / title / credential, founder photo.", "BuiltForAccess")
    bullet(doc, "heading, body, button label + link.", "MagicGallery")
    bullet(doc, "heading, intro, button label + link (→ FilmFreeway).", "Submissions")
    bullet(doc, "heading, body, button label + link.", "Archives")
    bullet(doc, "funder & press copy, donate link, press email, button labels.", "Support")
    bullet(doc, "sign-off, tagline, newsletter heading, copyright, contact email.", "Footer")
    bullet(doc, "venue name & address.", "SiteSettings")

    heading(doc, "List collections — add, remove, or reorder rows (set the Order number)")
    bullet(doc, "WhatIs — Clapperboard (slate lines) · BuiltForAccess — Stats · MagicGallery — Moments (reel photos) · Submissions — Chips · Support — Giving Tiers · Support — Press Kit (with links) · Partners · Marquee (banner phrases) · Socials.")

    heading(doc, "Photos & video")
    bullet(doc, "In any Image or Video field, upload/select in the Media Manager. Leave it empty and the built-in default shows.")

    heading(doc, "Leave these alone (they update themselves)")
    bullet(doc, "Tickets and the Schedule come from Wix Events. Submission deadlines are set in the code. The marquee \"Now Showing\" date is automatic.")

    output_path = os.path.join(_ROOT, "docs/Scope-Screenings-CMS-Guide.docx")
    doc.save(output_path)
    print(f"wrote {output_path}")

if __name__ == "__main__":
    main()
