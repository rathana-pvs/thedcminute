'use client'

import React, { useState } from 'react'
import { serializeLexical } from './serialize'
import AdskeeperWidget from '@/components/ads/AdskeeperWidget'

export type RichTextProps = {
  content: any
  className?: string
  articleTitle?: string          // Main article title for deduplication
  adWidgetId?: string            // Top in-article ad (before Continue Reading blur)
  adWidgetId2?: string           // Mid in-article ad (first ad in expanded section)
  secondAdWidgetId?: string      // Alias for adWidgetId2
  adWidgetId3?: string           // Lower in-article ad (lower ad in expanded section)
  underArticleWidgetId?: string  // Under-article native ad grid
  feedWidgetId?: string          // Feed widget
}

function extractNodeText(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractNodeText).join(' ')
  }
  return ''
}

export const RichText = ({
  content,
  className,
  articleTitle,
  adWidgetId,
  adWidgetId2,
  secondAdWidgetId,
  adWidgetId3,
  underArticleWidgetId,
  feedWidgetId,
}: RichTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content) return null

  // Lexical content structure: { root: { children: [...] } }
  const rawNodes = content.root?.children || []

  // Filter out any top nodes that duplicate articleTitle (checks top 3 blocks)
  let nodes = rawNodes
  if (articleTitle && rawNodes.length > 0) {
    const cleanTitle = articleTitle.trim().toLowerCase()
    const titlePrefix = cleanTitle.substring(0, Math.min(25, cleanTitle.length))
    nodes = rawNodes.filter((node: any, idx: number) => {
      if (idx >= 3) return true
      const text = extractNodeText(node).trim().toLowerCase()
      if (!text) return true
      if (
        text === cleanTitle || 
        (titlePrefix.length > 5 && text.startsWith(titlePrefix)) || 
        (text.length > 5 && cleanTitle.startsWith(text.substring(0, 25)))
      ) {
        return false
      }
      return true
    })
  }

  const primaryWidgetId =
    adWidgetId || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_1 || ''

  const secondaryWidgetId =
    adWidgetId2 || secondAdWidgetId || process.env.NEXT_PUBLIC_ADS_KEEPER_WIDGET_IN_ARTICLE_2 || ''

  // Locate the end of Paragraph 1. Only the first paragraph is visible before
  // the Continue Reading gate; paragraph 2 onward is revealed after expansion.
  let paragraphCount = 0
  let p1End = nodes.length

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].type === 'paragraph') {
      paragraphCount++
      if (paragraphCount === 1) {
        p1End = i + 1
      }
    }
  }

  // If article has only 1 paragraph or 1 block, show full article directly
  if (paragraphCount <= 1 || nodes.length <= 1) {
    return (
      <div className={`rich-text ${className || ''}`}>
        {primaryWidgetId && (
          <div className="my-6 w-full flex justify-center items-center">
            <AdskeeperWidget widgetId={primaryWidgetId} adType="in-article-1" className="!my-0" />
          </div>
        )}
        {serializeLexical(nodes, 'full')}
      </div>
    )
  }

  const topNodes = nodes.slice(0, p1End) // Paragraph 1
  const remainingNodes = nodes.slice(p1End) // Paragraph 2 onward (behind the gate)

  return (
    <div className={`rich-text ${className || ''}`}>
      {/* Ad before Paragraph 1 */}
      {primaryWidgetId && (
        <div className="my-6 w-full flex justify-center items-center">
          <AdskeeperWidget widgetId={primaryWidgetId} adType="in-article-1" className="!my-0" />
        </div>
      )}

      {/* Paragraph 1 — visible before the gate */}
      {serializeLexical(topNodes, 'top')}

      {remainingNodes.length === 0 ? null : !isExpanded ? (
        <div className="continue-reading-gate">
          {/* Continue Reading Button */}
          <div className="continue-reading-btn-row">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="continue-reading-btn"
            >
              <span>Continue Reading</span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="continue-reading-expanded">
          {serializeLexical(remainingNodes, 'bot')}

          {secondaryWidgetId && (
            <div className="my-6 w-full flex justify-center items-center">
              <AdskeeperWidget widgetId={secondaryWidgetId} adType="in-article-2" className="!my-0" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

