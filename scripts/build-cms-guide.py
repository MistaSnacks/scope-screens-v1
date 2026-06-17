# scripts/build-cms-guide.py
# Generates the one-page Scope Screenings CMS editor guide as a .docx,
# styled with the site brand (Aachen Bold headings, Libre Franklin body).
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

RUST = RGBColor(0xB1, 0x3A, 0x2A)
INK = RGBColor(0x14, 0x12, 0x10)

doc = Document()
for s in doc.sections:
    s.top_margin = s.bottom_margin = Inches(0.5)
    s.left_margin = s.right_margin = Inches(0.7)

def style_run(r, font="Libre Franklin", size=10.5, bold=False, color=INK):
    r.font.name = font; r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color

# Header: logo + title
doc.add_picture("public/popcorn-logo.png", height=Inches(0.55))
doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
h = doc.add_paragraph(); h.alignment = WD_ALIGN_PARAGRAPH.CENTER
style_run(h.add_run("Editing Your Website Content"), font="Aachen Bold", size=22, color=RUST)
sub = doc.add_paragraph(); sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
style_run(sub.add_run("A 1-page guide to the Scope Screenings CMS"), size=11)

def heading(text):
    p = doc.add_paragraph(); p.space_before = Pt(8)
    style_run(p.add_run(text), font="Aachen Bold", size=13, color=RUST)

def bullet(text, label=None):
    p = doc.add_paragraph(style="List Bullet")
    if label:
        style_run(p.add_run(label + ": "), bold=True)
    style_run(p.add_run(text))

heading("The one rule")
body = doc.add_paragraph()
style_run(body.add_run("Open the CMS in your Wix dashboard → pick the collection → edit the fields → click Publish. Your live site updates within the hour."))

heading("Sections — edit any section's words, title, image, or button")
bullet("the big heading for that section.", "Title")
bullet("the small label above the title (e.g. “Chapter Three”).", "Eyebrow")
bullet("the paragraph text.", "Body")
bullet("upload a new photo for that section.", "Image")
bullet("the button text and where it links (e.g. the Submit button → FilmFreeway).", "Button label / Button link")
bullet("leave this alone — it tells the website which section this is.", "Section key")

heading("Partners — add or change sponsors")
bullet("Add a row for a new partner: name, logo (upload), link, and order. Remove a row to drop a partner.")

heading("Marquee — the scrolling banner under the hero")
bullet("Each row is one phrase. The “Now Showing” date is automatic from your ticketing — you don’t edit that.")

heading("Socials & Settings")
bullet("Socials: add/edit the Instagram, TikTok, YouTube links in the footer.")
bullet("Settings: contact email, venue name/address, door & screening times, newsletter heading, footer tagline, copyright.")

heading("Leave these alone (they update themselves)")
bullet("Tickets and the Schedule come straight from Wix Events — manage those where you already sell tickets.")

doc.save("docs/Scope-Screenings-CMS-Guide.docx")
print("wrote docs/Scope-Screenings-CMS-Guide.docx")
