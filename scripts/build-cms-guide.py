# scripts/build-cms-guide.py
# Generates the Scope Screenings CMS editor guide as a .docx, brand-styled
# (Aachen Bold headings, Libre Franklin body) with an annotated screenshot per
# section. Screenshots come from .shots/guide/*.png (see .shots/capture-cms-guide.mjs).
import os
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(_ROOT, ".shots/guide")

RUST = RGBColor(0xB1, 0x3A, 0x2A)
INK = RGBColor(0x14, 0x12, 0x10)
GREY = RGBColor(0x55, 0x50, 0x4A)


def style_run(r, font="Libre Franklin", size=10.5, bold=False, color=INK):
    r.font.name = font
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.color.rgb = color


def heading(doc, text, size=14):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(2)
    style_run(p.add_run(text), font="Aachen Bold", size=size, color=RUST)
    return p


def para(doc, text, color=INK, size=10.5, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    style_run(p.add_run(text), size=size, color=color)
    return p


def bullet(doc, text, label=None):
    p = doc.add_paragraph(style="List Bullet")
    if label:
        style_run(p.add_run(label + ": "), bold=True)
    style_run(p.add_run(text))


def legend_line(doc, n, name, desc):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(1)
    style_run(p.add_run(f"{n}  "), bold=True, color=RUST, size=11)
    style_run(p.add_run(name), bold=True)
    style_run(p.add_run(" — " + desc))


# (key, heading, collections-note, [ (n, name, desc) ... ], also-note)
SECTIONS = [
    ("Hero", "Hero", "Form: Hero", [
        ("1", "Eyebrow", "small label above the title (e.g. “Feature Presentation”)."),
        ("2", "Title", "the big wordmark. Put a line break in the field for two lines."),
        ("3", "Tagline", "the line under the wordmark."),
    ], "Also in the Hero form: Poster image (the still shown before the video plays) and Video (the background reel — upload/select in the Media Manager)."),

    ("WhatIs", "What Is Scope", "Form: WhatIs  +  List: WhatIs — Clapperboard", [
        ("1", "Eyebrow", "the small mono label."),
        ("2", "Title", "the section heading."),
        ("3", "Body", "the editorial paragraph."),
        ("4", "Motto", "the italic quote line."),
        ("5", "Clapperboard", "the slate lines (Director / Location / Est. / Runs) live in the “WhatIs — Clapperboard” list — one row per line (Field + Value)."),
    ], None),

    ("BuiltForAccess", "Built For Access", "Form: BuiltForAccess  +  List: BuiltForAccess — Stats", [
        ("1", "Eyebrow", "the chapter label."),
        ("2", "Title", "the section heading (line break allowed)."),
        ("3", "Founder quote", "the large blockquote."),
        ("4", "Founder name", "shown on the photo frame and beside the quote."),
        ("5", "Stats", "the big numbers (200+, 150+ …) live in the “BuiltForAccess — Stats” list."),
    ], "Also in the form: Founder title, Founder credential, and the Founder photo (upload)."),

    ("MagicGallery", "Scope Screenings Magic", "Form: MagicGallery  +  List: MagicGallery — Moments", [
        ("1", "Eyebrow", "the chapter label."),
        ("2", "Title", "the section heading (line break allowed)."),
        ("3", "Body", "the paragraph."),
        ("4", "Button", "the link text and where it goes (label + link)."),
    ], "The reel photos live in “MagicGallery — Moments” — one row per photo (image, badge, title, caption, order)."),

    ("Submissions", "Submissions", "Form: Submissions  +  List: Submissions — Chips", [
        ("1", "Eyebrow", "the open-call label."),
        ("2", "Title", "the section heading."),
        ("3", "Intro", "the paragraph under the title."),
        ("4", "Chips", "the little meta tags live in the “Submissions — Chips” list."),
        ("5", "Button + link", "the Submit button text and where it points (FilmFreeway)."),
    ], "Note: the deadline ladder and notification date are set in the code, not the CMS."),

    ("Archives", "The Archives", "Form: Archives", [
        ("1", "Eyebrow", "the chapter label."),
        ("2", "Title", "the section heading."),
        ("3", "Body", "the paragraph."),
        ("4", "Button + link", "the link text and where it goes (the schedule)."),
    ], "Note: the film thumbnails (the filmstrip) are not in the CMS yet — they live in the code for now."),

    ("Support", "Keep It Running", "Form: Support  +  Lists: Support — Giving Tiers, Support — Press Kit", [
        ("1", "Title", "the section heading."),
        ("2", "Funder copy", "the “Become a Funder” card title and body."),
        ("3", "Giving tiers", "the donor chips live in the “Support — Giving Tiers” list."),
        ("4", "Donate link", "where “Support the Festival” goes — change this if your fiscal sponsor changes."),
        ("5", "Press kit", "the press rows and their download links live in the “Support — Press Kit” list."),
    ], "Also in the Support form: the Press card title & body, and the Press email."),

    ("Footer", "Footer", "Form: Footer  +  List: Socials", [
        ("1", "Sign-off", "the big sign-off heading."),
        ("2", "Newsletter heading", "the text above the email sign-up."),
        ("3", "Socials", "the Instagram / TikTok / YouTube links live in the “Socials” list."),
        ("4", "Copyright", "the line at the very bottom."),
    ], "Also in the Footer form: the tagline paragraph and the contact email."),
]


def main():
    doc = Document()
    for s in doc.sections:
        s.top_margin = s.bottom_margin = Inches(0.6)
        s.left_margin = s.right_margin = Inches(0.7)

    # Cover header
    logo = os.path.join(_ROOT, "public/popcorn-logo.png")
    doc.add_picture(logo, height=Inches(0.7))
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    h = doc.add_paragraph(); h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    style_run(h.add_run("Editing Your Website Content"), font="Aachen Bold", size=24, color=RUST)
    sub = doc.add_paragraph(); sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    style_run(sub.add_run("A visual guide to the Scope Screenings CMS"), size=12, color=GREY)

    heading(doc, "The one rule")
    para(doc, "Open the CMS in your Wix dashboard → pick the collection for the part of the page you want to "
              "change → edit the fields → click Publish. Your live site updates within the hour.")

    heading(doc, "How it's organized")
    para(doc, "Every part of the page is its own collection, named after the section. A section's form (a single "
              "editable card) holds its words and images; its matching “— List” collections hold the "
              "repeating rows (clapperboard lines, stats, photos, tiers, etc.). They sit next to each other in the "
              "sidebar. On each screenshot below, the numbered pins show exactly what each field controls.")

    for key, title, collections, items, also in SECTIONS:
        doc.add_page_break()
        heading(doc, title)
        c = doc.add_paragraph(); c.paragraph_format.space_after = Pt(6)
        style_run(c.add_run(collections), size=9.5, bold=True, color=GREY)
        img = os.path.join(SHOTS, f"{key}.png")
        if os.path.exists(img):
            doc.add_picture(img, width=Inches(7.0))
            doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
            doc.paragraphs[-1].paragraph_format.space_after = Pt(6)
        for n, name, desc in items:
            legend_line(doc, n, name, desc)
        if also:
            a = doc.add_paragraph(); a.paragraph_format.space_before = Pt(4)
            style_run(a.add_run(also), size=10, color=GREY)

    doc.add_page_break()
    heading(doc, "Photos & video")
    bullet(doc, "In any Image or Video field, upload or select in the Wix Media Manager. Leave it empty and the "
                "built-in default shows — nothing breaks.")
    bullet(doc, "Partner logos work the same way: upload in the Partners list, or leave empty to use the built-in logo.")

    heading(doc, "Leave these alone (they update themselves)")
    bullet(doc, "Tickets and the Schedule come straight from Wix Events — manage those where you already sell tickets.")
    bullet(doc, "Submission deadlines and the notification date are set in the code.")
    bullet(doc, "The marquee's “Now Showing” date is automatic from your next event.")

    heading(doc, "Good to know")
    bullet(doc, "Every list row has an Order number — lower numbers show first.")
    bullet(doc, "Two lines in one field (e.g. a title): press Enter/Shift+Enter inside the field to add the line break.")
    bullet(doc, "Don't see your change? Give it up to an hour, or republish.")

    out = os.path.join(_ROOT, "docs/Scope-Screenings-CMS-Guide.docx")
    doc.save(out)
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
