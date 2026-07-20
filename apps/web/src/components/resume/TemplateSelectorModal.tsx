'use client';

import React from 'react';
import { TemplateId, ColorThemeId, COLOR_THEMES } from './ResumeTemplates';
import { Layout, Palette, Check } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: TemplateId;
  onSelectTemplate: (template: TemplateId) => void;
  selectedColor: ColorThemeId;
  onSelectColor: (color: ColorThemeId) => void;
  tTemplates?: Record<string, string>;
  tColors?: Record<string, string>;
}

export const TEMPLATE_ITEMS: Array<{
  id: TemplateId;
  title: string;
  desc: string;
  badge: string;
}> = [
  {
    id: 'modern',
    title: 'Modern Classic',
    desc: 'Rozetler ve renkli vurgular içeren dengeli 1 sütunlu modern düzen.',
    badge: 'Popüler',
  },
  {
    id: 'executive',
    title: 'Executive / Kurumsal',
    desc: 'Serif fontlar ve resmi çift çizgiler içeren prestijli kurumsal görünüm.',
    badge: 'Kurumsal',
  },
  {
    id: 'sidebar',
    title: 'Sol Menülü / Çift Sütun',
    desc: 'Sol sütunda profil resmi, iletişim ve yetenekler olan çift sütunlu yapı.',
    badge: 'Çift Sütun',
  },
  {
    id: 'minimal',
    title: 'Minimalist / Sade',
    desc: 'Maksimum okunabilirlik sağlayan yüksek netlikte sade tasarım.',
    badge: 'Sade',
  },
];

/**
 * Miniature A4 Preview Renderer
 * Generates an accurate scaled visual mock of the CV template styled with the chosen accent color
 */
const MiniA4Preview: React.FC<{
  templateId: TemplateId;
  colorId: ColorThemeId;
}> = ({ templateId, colorId }) => {
  const theme = COLOR_THEMES[colorId] || COLOR_THEMES.blue;
  const hex = theme.hex;

  // 1. MODERN CLASSIC MINI PREVIEW
  if (templateId === 'modern') {
    return (
      <div className="w-full aspect-[1/1.3] bg-white rounded-lg shadow-sm border border-zinc-200 p-2.5 flex flex-col gap-1.5 overflow-hidden select-none pointer-events-none">
        {/* Header */}
        <div
          className="flex justify-between items-start border-b pb-1.5"
          style={{ borderColor: `${hex}40` }}
        >
          <div className="space-y-1">
            <div className="h-2 w-16 bg-zinc-800 rounded-xs font-bold" />
            <div
              className="h-1.5 w-10 rounded-xs"
              style={{ backgroundColor: hex }}
            />
          </div>
          <div className="space-y-0.5 text-[6px] text-zinc-400 text-right">
            <div className="h-1 w-8 bg-zinc-300 rounded-xs" />
            <div className="h-1 w-6 bg-zinc-300 rounded-xs" />
          </div>
        </div>
        {/* Section 1 */}
        <div className="space-y-1">
          <div
            className="h-1.5 w-12 rounded-xs"
            style={{ backgroundColor: hex }}
          />
          <div className="h-1 w-full bg-zinc-200 rounded-xs" />
          <div className="h-1 w-4/5 bg-zinc-200 rounded-xs" />
        </div>
        {/* Section 2 */}
        <div className="space-y-1 mt-0.5">
          <div
            className="h-1.5 w-14 rounded-xs"
            style={{ backgroundColor: hex }}
          />
          <div className="flex justify-between">
            <div className="h-1.5 w-12 bg-zinc-700 rounded-xs" />
            <div className="h-1 w-6 bg-zinc-300 rounded-xs" />
          </div>
          <div className="h-1 w-full bg-zinc-200 rounded-xs" />
          <div className="h-1 w-11/12 bg-zinc-200 rounded-xs" />
        </div>
      </div>
    );
  }

  // 2. EXECUTIVE PROFESSIONAL MINI PREVIEW
  if (templateId === 'executive') {
    return (
      <div className="w-full aspect-[1/1.3] bg-white rounded-lg shadow-sm border border-zinc-200 p-2.5 flex flex-col gap-1.5 overflow-hidden select-none pointer-events-none">
        {/* Header */}
        <div className="text-center space-y-1 border-b-2 border-zinc-900 pb-1.5">
          <div className="h-2 w-20 bg-zinc-900 mx-auto rounded-xs" />
          <div className="h-1 w-12 bg-zinc-500 mx-auto rounded-xs" />
          <div className="flex justify-center gap-1 pt-0.5">
            <div className="h-0.5 w-6 bg-zinc-300" />
            <div className="h-0.5 w-6 bg-zinc-300" />
          </div>
        </div>
        {/* Section Title Double Line */}
        <div className="border-y border-zinc-800 py-0.5 my-0.5 text-center">
          <div className="h-1 w-10 bg-zinc-800 mx-auto rounded-xs" />
        </div>
        <div className="space-y-1">
          <div className="h-1 w-full bg-zinc-200 rounded-xs" />
          <div className="h-1 w-3/4 bg-zinc-200 rounded-xs" />
        </div>
        <div className="border-y border-zinc-800 py-0.5 my-0.5 text-center">
          <div className="h-1 w-12 bg-zinc-800 mx-auto rounded-xs" />
        </div>
        <div className="space-y-1">
          <div className="h-1.5 w-16 bg-zinc-700 rounded-xs" />
          <div className="h-1 w-full bg-zinc-200 rounded-xs" />
          <div className="h-1 w-5/6 bg-zinc-200 rounded-xs" />
        </div>
      </div>
    );
  }

  // 3. LEFT SIDEBAR MINI PREVIEW
  if (templateId === 'sidebar') {
    return (
      <div className="w-full aspect-[1/1.3] bg-white rounded-lg shadow-sm border border-zinc-200 grid grid-cols-12 overflow-hidden select-none pointer-events-none">
        {/* Left Sidebar Column */}
        <div
          className="col-span-4 p-1.5 flex flex-col gap-1.5"
          style={{ backgroundColor: `${hex}18` }}
        >
          <div
            className="h-5 w-5 rounded-full mx-auto shadow-xs"
            style={{ backgroundColor: hex }}
          />
          <div className="h-1.5 w-10 bg-zinc-800 mx-auto rounded-xs" />
          <div
            className="h-1 w-8 mx-auto rounded-xs"
            style={{ backgroundColor: hex }}
          />
          <div className="space-y-1 mt-1 border-t pt-1 border-zinc-300/60">
            <div className="h-1 w-8 bg-zinc-400 rounded-xs" />
            <div className="h-1 w-10 bg-zinc-300 rounded-xs" />
            <div className="h-1 w-9 bg-zinc-300 rounded-xs" />
          </div>
        </div>

        {/* Right Main Column */}
        <div className="col-span-8 p-2 flex flex-col gap-1.5">
          <div className="space-y-1">
            <div
              className="h-1.5 w-10 rounded-xs"
              style={{ backgroundColor: hex }}
            />
            <div className="h-1 w-full bg-zinc-200 rounded-xs" />
            <div className="h-1 w-4/5 bg-zinc-200 rounded-xs" />
          </div>
          <div className="space-y-1 mt-1">
            <div
              className="h-1.5 w-12 rounded-xs"
              style={{ backgroundColor: hex }}
            />
            <div className="h-1 w-full bg-zinc-200 rounded-xs" />
            <div className="h-1 w-11/12 bg-zinc-200 rounded-xs" />
          </div>
        </div>
      </div>
    );
  }

  // 4. MINIMALIST CLEAN MINI PREVIEW
  return (
    <div className="w-full aspect-[1/1.3] bg-white rounded-lg shadow-sm border border-zinc-200 p-2.5 flex flex-col gap-1.5 overflow-hidden select-none pointer-events-none">
      {/* Header */}
      <div className="flex justify-between items-baseline border-b border-zinc-200 pb-1.5">
        <div className="h-2 w-14 bg-zinc-900 rounded-xs" />
        <div className="h-1 w-10 bg-zinc-400 rounded-xs" />
      </div>
      {/* Mono Section */}
      <div className="space-y-1">
        <div className="h-1 w-10 bg-zinc-400 font-mono" />
        <div className="h-1 w-full bg-zinc-200 rounded-xs" />
        <div className="h-1 w-5/6 bg-zinc-200 rounded-xs" />
      </div>
      <div className="space-y-1 mt-0.5">
        <div className="h-1 w-12 bg-zinc-400 font-mono" />
        <div className="h-1.5 w-14 bg-zinc-700 rounded-xs" />
        <div className="h-1 w-full bg-zinc-200 rounded-xs" />
      </div>
    </div>
  );
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
  selectedColor,
  onSelectColor,
  tTemplates,
  tColors,
}) => {
  return (
    <div className="flex flex-col gap-5 w-full bg-card/70 backdrop-blur-xs p-5 rounded-2xl border border-border/80 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Layout className="h-4 w-4 text-primary" />
          <span>CV Şablonu ve Renk Tasarımı</span>
        </h4>

        <span className="text-[11px] font-medium text-muted-foreground">
          A4 Önizleme:{' '}
          <span className="font-semibold text-foreground">
            {COLOR_THEMES[selectedColor]?.name}
          </span>
        </span>
      </div>

      {/* Color Palette Selector FIRST */}
      <div className="space-y-2 pb-1">
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5 text-primary" />
          <span>Vurgu Rengi Seçin (Accent Color)</span>
        </label>

        <div className="flex items-center gap-3 flex-wrap ">
          {(Object.keys(COLOR_THEMES) as ColorThemeId[]).map((colorId) => {
            const colorObj = COLOR_THEMES[colorId];
            const isSelected = selectedColor === colorId;

            return (
              <button
                key={colorId}
                type="button"
                onClick={() => onSelectColor(colorId)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-background shadow-xs ring-2 ring-primary/20 scale-105'
                    : 'border-border/60 bg-muted/30 hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: colorObj.hex }}
                />
                <span>{tColors?.[colorId] || colorObj.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Template Grid Cards with Mini A4 Visual Previews */}
      <div className="grid grid-cols-2 gap-3.5">
        {TEMPLATE_ITEMS.map((item) => {
          const isSelected = selectedTemplate === item.id;
          const title = tTemplates?.[item.id] || item.title;
          const desc = tTemplates?.[`${item.id}Desc`] || item.desc;

          return (
            <div
              key={item.id}
              onClick={() => onSelectTemplate(item.id)}
              className={`relative flex flex-col p-3 rounded-xl border-2 transition-all cursor-pointer select-none group ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                  : 'border-border/60 hover:border-border hover:bg-muted/40'
              }`}
            >
              {/* Badge & Check */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                  {item.badge}
                </span>
                {isSelected && (
                  <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Scaled Mini A4 Visual Document Mockup */}
              <div className="mb-2.5 transition-transform duration-300 group-hover:scale-105">
                <MiniA4Preview templateId={item.id} colorId={selectedColor} />
              </div>

              {/* Title & Desc */}
              <h5 className="font-bold text-xs text-foreground leading-tight">
                {title}
              </h5>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-tight">
                {desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
