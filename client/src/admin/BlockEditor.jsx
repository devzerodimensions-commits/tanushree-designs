import { useState } from 'react';
import Icon from '../lib/icons.jsx';
import { Field, ImagePicker, ListEditor, Switch } from './ui.jsx';

/**
 * Build a page out of blocks.
 *
 * Written for someone who has never built a web page: every block is named
 * for what it looks like rather than what it is called in code, each one says
 * plainly what it does, and nothing here can put the site into a state that
 * needs a developer to undo. Blocks move with arrows rather than drag and
 * drop, which is far easier to operate on a laptop trackpad and works on a
 * phone.
 */

/** Each kind of block: how it is described, and what it starts life as. */
export const BLOCK_TYPES = [
  {
    type: 'heading',
    label: 'Section heading',
    icon: 'edit',
    blurb: 'A centred heading with an optional small label above and a line of introduction below.',
    blank: { eyebrow: '', title: 'A new section', text: '' },
  },
  {
    type: 'text',
    label: 'Paragraphs',
    icon: 'file',
    blurb: 'A block of writing. Leave a blank line between paragraphs.',
    blank: { title: '', body: '', centred: false },
  },
  {
    type: 'image',
    label: 'Picture',
    icon: 'image',
    blurb: 'One picture across the page, with an optional caption underneath.',
    blank: { image: '', alt: '', caption: '', ratio: '16 / 9' },
  },
  {
    type: 'imageText',
    label: 'Picture beside writing',
    icon: 'layout',
    blurb: 'A picture on one side and writing on the other, with an optional button.',
    blank: { image: '', eyebrow: '', title: '', body: '', flip: false, button_label: '', button_link: '' },
  },
  {
    type: 'points',
    label: 'Tick list',
    icon: 'check',
    blurb: 'A list of short points, each with a tick beside it.',
    blank: { eyebrow: '', title: '', text: '', items: [] },
  },
  {
    type: 'cards',
    label: 'Cards',
    icon: 'grid',
    blurb: 'A row of cards, each with a picture, a name and a line of writing.',
    blank: { eyebrow: '', title: '', text: '', items: [] },
  },
  {
    type: 'cta',
    label: 'Call to action',
    icon: 'sparkle',
    blurb: 'A wide band inviting the reader to get in touch, with a button.',
    blank: { title: 'Ready to start?', text: '', image: '', button_label: 'Contact us', button_link: '/contact-us' },
  },
];

const META = Object.fromEntries(BLOCK_TYPES.map((b) => [b.type, b]));

/** Enough for React keys; these never leave the browser as identity. */
const newId = () => `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ------------------------------------------------------------- pickers */

function ToneField({ value, onChange }) {
  return (
    <Field label="Background" hint="Alternate these so sections do not run together">
      <select value={value || 'white'} onChange={(e) => onChange(e.target.value)}>
        <option value="white">White</option>
        <option value="cream">Soft cream</option>
      </select>
    </Field>
  );
}

/** The repeating cards inside a Cards block. */
function CardsEditor({ items = [], onChange }) {
  const list = Array.isArray(items) ? items : [];
  const setAt = (i, patch) =>
    onChange(list.map((it, n) => (n === i ? { ...it, ...patch } : it)));

  return (
    <div className="block-cards">
      {list.map((item, i) => (
        <div className="block-card" key={i}>
          <div className="block-card__head">
            <b>Card {i + 1}</b>
            <div className="row-actions">
              <button
                className="icon-btn"
                title="Move up"
                disabled={i === 0}
                onClick={() => {
                  const next = [...list];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  onChange(next);
                }}
              >
                <Icon.arrowUp />
              </button>
              <button
                className="icon-btn"
                title="Move down"
                disabled={i === list.length - 1}
                onClick={() => {
                  const next = [...list];
                  [next[i + 1], next[i]] = [next[i], next[i + 1]];
                  onChange(next);
                }}
              >
                <Icon.arrowUp style={{ transform: 'rotate(180deg)' }} />
              </button>
              <button
                className="icon-btn icon-btn--danger"
                title="Remove this card"
                onClick={() => onChange(list.filter((_, n) => n !== i))}
              >
                <Icon.trash />
              </button>
            </div>
          </div>

          <div className="a-grid-2">
            <Field label="Name" full>
              <input
                type="text"
                value={item.title ?? ''}
                onChange={(e) => setAt(i, { title: e.target.value })}
              />
            </Field>
            <Field label="Writing" full>
              <textarea
                rows={2}
                value={item.text ?? ''}
                onChange={(e) => setAt(i, { text: e.target.value })}
              />
            </Field>
            <Field label="Picture" full>
              <ImagePicker
                value={item.image}
                onChange={(v) => setAt(i, { image: v })}
                folder="general"
              />
            </Field>
          </div>
        </div>
      ))}

      <button
        className="btn btn--ghost btn--sm"
        onClick={() => onChange([...list, { title: '', text: '', image: '' }])}
      >
        <Icon.plus /> Add a card
      </button>
    </div>
  );
}

/* --------------------------------------------------------- block forms */

function BlockFields({ block, onChange }) {
  const set = (patch) => onChange({ ...block, ...patch });

  switch (block.type) {
    case 'heading':
      return (
        <div className="a-grid-2">
          <Field label="Small label above" hint="Optional — e.g. WHAT WE DO">
            <input type="text" value={block.eyebrow ?? ''} onChange={(e) => set({ eyebrow: e.target.value })} />
          </Field>
          <ToneField value={block.tone} onChange={(v) => set({ tone: v })} />
          <Field label="Heading" full>
            <input type="text" value={block.title ?? ''} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Introduction" full>
            <textarea rows={2} value={block.text ?? ''} onChange={(e) => set({ text: e.target.value })} />
          </Field>
        </div>
      );

    case 'text':
      return (
        <div className="a-grid-2">
          <Field label="Heading" hint="Optional">
            <input type="text" value={block.title ?? ''} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <ToneField value={block.tone} onChange={(v) => set({ tone: v })} />
          <Field label="Writing" hint="Leave a blank line between paragraphs" full>
            <textarea rows={7} value={block.body ?? ''} onChange={(e) => set({ body: e.target.value })} />
          </Field>
          <Field full>
            <Switch checked={block.centred} onChange={(v) => set({ centred: v })} label="Centre this on the page" />
          </Field>
        </div>
      );

    case 'image':
      return (
        <div className="a-grid-2">
          <Field label="Shape" hint="How tall the picture is on the page">
            <select value={block.ratio || '16 / 9'} onChange={(e) => set({ ratio: e.target.value })}>
              <option value="16 / 9">Wide</option>
              <option value="3 / 2">Standard</option>
              <option value="1 / 1">Square</option>
              <option value="4 / 5">Tall</option>
            </select>
          </Field>
          <ToneField value={block.tone} onChange={(v) => set({ tone: v })} />
          <Field label="Picture" full>
            <ImagePicker value={block.image} onChange={(v) => set({ image: v })} folder="general" />
          </Field>
          <Field label="Caption" hint="Optional, shown under the picture">
            <input type="text" value={block.caption ?? ''} onChange={(e) => set({ caption: e.target.value })} />
          </Field>
          <Field label="Description for screen readers" hint="What the picture shows">
            <input type="text" value={block.alt ?? ''} onChange={(e) => set({ alt: e.target.value })} />
          </Field>
        </div>
      );

    case 'imageText':
      return (
        <div className="a-grid-2">
          <Field label="Small label above" hint="Optional">
            <input type="text" value={block.eyebrow ?? ''} onChange={(e) => set({ eyebrow: e.target.value })} />
          </Field>
          <ToneField value={block.tone} onChange={(v) => set({ tone: v })} />
          <Field label="Heading" full>
            <input type="text" value={block.title ?? ''} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Writing" hint="Leave a blank line between paragraphs" full>
            <textarea rows={5} value={block.body ?? ''} onChange={(e) => set({ body: e.target.value })} />
          </Field>
          <Field label="Picture" full>
            <ImagePicker value={block.image} onChange={(v) => set({ image: v })} folder="general" />
          </Field>
          <Field label="Button words" hint="Leave both blank for no button">
            <input
              type="text"
              value={block.button_label ?? ''}
              onChange={(e) => set({ button_label: e.target.value })}
            />
          </Field>
          <Field label="Button goes to" hint="e.g. /contact-us">
            <input
              type="text"
              value={block.button_link ?? ''}
              onChange={(e) => set({ button_link: e.target.value })}
            />
          </Field>
          <Field full>
            <Switch checked={block.flip} onChange={(v) => set({ flip: v })} label="Put the picture on the right" />
          </Field>
        </div>
      );

    case 'points':
      return (
        <div className="a-grid-2">
          <Field label="Small label above" hint="Optional">
            <input type="text" value={block.eyebrow ?? ''} onChange={(e) => set({ eyebrow: e.target.value })} />
          </Field>
          <ToneField value={block.tone} onChange={(v) => set({ tone: v })} />
          <Field label="Heading" full>
            <input type="text" value={block.title ?? ''} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="The points" full>
            <ListEditor
              value={block.items}
              onChange={(v) => set({ items: v })}
              placeholder="Add a point"
            />
          </Field>
        </div>
      );

    case 'cards':
      return (
        <>
          <div className="a-grid-2">
            <Field label="Small label above" hint="Optional">
              <input type="text" value={block.eyebrow ?? ''} onChange={(e) => set({ eyebrow: e.target.value })} />
            </Field>
            <ToneField value={block.tone} onChange={(v) => set({ tone: v })} />
            <Field label="Heading" full>
              <input type="text" value={block.title ?? ''} onChange={(e) => set({ title: e.target.value })} />
            </Field>
          </div>
          <CardsEditor items={block.items} onChange={(v) => set({ items: v })} />
        </>
      );

    case 'cta':
      return (
        <div className="a-grid-2">
          <Field label="Heading" full>
            <input type="text" value={block.title ?? ''} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Writing" full>
            <textarea rows={2} value={block.text ?? ''} onChange={(e) => set({ text: e.target.value })} />
          </Field>
          <Field label="Button words">
            <input
              type="text"
              value={block.button_label ?? ''}
              onChange={(e) => set({ button_label: e.target.value })}
            />
          </Field>
          <Field label="Button goes to" hint="e.g. /contact-us">
            <input
              type="text"
              value={block.button_link ?? ''}
              onChange={(e) => set({ button_link: e.target.value })}
            />
          </Field>
          <Field label="Background picture" full>
            <ImagePicker value={block.image} onChange={(v) => set({ image: v })} folder="general" />
          </Field>
        </div>
      );

    default:
      return (
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
          This block was made with a newer version of the site and cannot be edited here. It still
          shows on the page, and you can remove it.
        </p>
      );
  }
}

/* -------------------------------------------------------------- editor */

export default function BlockEditor({ blocks = [], onChange }) {
  const list = Array.isArray(blocks) ? blocks : [];
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);

  const move = (i, by) => {
    const j = i + by;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const add = (meta) => {
    const block = { id: newId(), type: meta.type, ...structuredClone(meta.blank) };
    onChange([...list, block]);
    setOpenId(block.id);
    setAdding(false);
  };

  return (
    <div className="block-editor">
      {list.length === 0 && (
        <div className="block-empty">
          <Icon.layout />
          <b>This page is empty</b>
          <p>
            Add your first block below. You can reorder or remove anything afterwards, and nothing
            is public until you switch the page on.
          </p>
        </div>
      )}

      {list.map((block, i) => {
        const meta = META[block.type];
        const Glyph = Icon[meta?.icon] || Icon.file;
        const open = openId === (block.id ?? i);

        return (
          <div className={`block-row${open ? ' is-open' : ''}`} key={block.id ?? i}>
            <div className="block-row__bar">
              <button
                className="block-row__handle"
                onClick={() => setOpenId(open ? null : (block.id ?? i))}
                aria-expanded={open}
              >
                <span className="block-row__icon">
                  <Glyph />
                </span>
                <span className="block-row__name">
                  <b>{meta?.label ?? block.type}</b>
                  <small>{block.title || block.eyebrow || meta?.blurb}</small>
                </span>
                <Icon.chevronDown className="block-row__chev" />
              </button>

              <div className="row-actions">
                <button className="icon-btn" title="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  <Icon.arrowUp />
                </button>
                <button
                  className="icon-btn"
                  title="Move down"
                  disabled={i === list.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <Icon.arrowUp style={{ transform: 'rotate(180deg)' }} />
                </button>
                <button
                  className="icon-btn icon-btn--danger"
                  title="Remove this block"
                  onClick={() => onChange(list.filter((_, n) => n !== i))}
                >
                  <Icon.trash />
                </button>
              </div>
            </div>

            {open && (
              <div className="block-row__body">
                <BlockFields
                  block={block}
                  onChange={(next) => onChange(list.map((b, n) => (n === i ? next : b)))}
                />
              </div>
            )}
          </div>
        );
      })}

      {adding ? (
        <div className="block-picker">
          <div className="block-picker__head">
            <b>What would you like to add?</b>
            <button className="icon-btn" onClick={() => setAdding(false)} title="Cancel">
              <Icon.close />
            </button>
          </div>
          <div className="block-picker__grid">
            {BLOCK_TYPES.map((meta) => {
              const Glyph = Icon[meta.icon] || Icon.file;
              return (
                <button className="block-choice" key={meta.type} onClick={() => add(meta)}>
                  <span className="block-choice__icon">
                    <Glyph />
                  </span>
                  <b>{meta.label}</b>
                  <small>{meta.blurb}</small>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <button className="btn btn--ghost block-add" onClick={() => setAdding(true)}>
          <Icon.plus /> Add a block
        </button>
      )}
    </div>
  );
}
