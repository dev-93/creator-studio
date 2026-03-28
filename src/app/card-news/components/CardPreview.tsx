'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardPreviewProps {
  cardData: {
    card: number;
    title?: string;
    subtitle?: string;
    body?: string;
    question?: string;
    preview?: string;
    category?: string;
  };
  design?: {
    themeName: string;
    gradientFrom: string;
    gradientTo: string;
    glowColor: string;
    accentColor: string;
  };
}

export default function CardPreview({ cardData, design }: CardPreviewProps) {
  // Determine layout style based on card number
  const isTitleCard = cardData.card === 1;
  const isLastCard = cardData.card === 5;

  // Fallback defaults
  const gradientFrom = design?.gradientFrom || '#111111';
  const gradientTo = design?.gradientTo || '#000000';
  const glowColor = design?.glowColor || 'rgba(99, 102, 241, 0.15)';
  const accentColor = design?.accentColor || '#6366f1';
  const themeName = design?.themeName || 'PREMIUM AI';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-preview-renderer"
      style={{
        width: '100%',
        maxWidth: '360px',
        aspectRatio: '1 / 1.25', // Instagram Portrait-ish
        background: '#0a0a0a',
        borderRadius: '32px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Background Layer: Dynamic Gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        zIndex: 0
      }} />
      
      {/* Animated Subtle Glow using design.glowColor */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '60%',
        height: '60%',
        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        zIndex: 1
      }} />

      {/* Aesthetic Theme Placeholder */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'rgba(255,255,255,0.02)',
        fontSize: '4.5rem',
        fontWeight: 900,
        whiteSpace: 'nowrap',
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        {themeName.toUpperCase()}
      </div>

      {/* Content Layer */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        height: '100%', 
        padding: '32px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between' 
      }}>
        
        {/* Top: Branding/Category */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            padding: '6px 14px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            borderRadius: '100px',
            fontSize: '0.65rem',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.9)',
            letterSpacing: '0.1em',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            AI TREND | {cardData.card} OF 5
          </div>
          <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'rgba(255, 255, 255, 0.3)', letterSpacing: '0.2em' }}>
            @AI_TREND_KR
          </div>
        </div>

        {/* Center/Bottom: Messaging */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isTitleCard ? (
            <div style={{ textAlign: 'left' }}>
               <h1 style={{ 
                fontSize: '2.2rem', 
                fontWeight: 900, 
                lineHeight: 1.1, 
                color: '#fff', 
                marginBottom: '12px',
                letterSpacing: '-0.02em'
              }}>
                {cardData.title}
              </h1>
              <div style={{ width: '40px', height: '4px', background: accentColor, borderRadius: '2px', marginBottom: '16px' }} />
              <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.4 }}>
                {cardData.subtitle}
              </p>
            </div>
          ) : isLastCard ? (
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
                {cardData.question}
              </h2>
              <p style={{ fontSize: '0.9rem', color: accentColor, fontWeight: 700 }}>
                {cardData.preview}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cardData.title && (
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
                  {cardData.title}
                </h2>
              )}
              {cardData.body && (
                <p style={{ 
                  fontSize: '0.95rem', 
                  color: 'rgba(255, 255, 255, 0.85)', 
                  lineHeight: 1.6,
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {cardData.body}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom: Action/Logo */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
           <span style={{ 
            fontSize: '0.7rem', 
            fontWeight: 800, 
            color: 'rgba(255, 255, 255, 0.2)', 
            letterSpacing: '0.3em',
            textTransform: 'uppercase'
          }}>
            Premium AI Content
          </span>
        </div>
      </div>
    </motion.div>
  );
}
