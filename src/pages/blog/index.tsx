import Link from 'next/link'
import Header from '../../components/header'
// import React from 'react'
// import components from '../../components/dynamic'

import blogStyles from '../../styles/blog.module.css'
import sharedStyles from '../../styles/shared.module.css'

import {
  getBlogLink,
  getDateStr,
  postIsPublished,
} from '../../lib/blog-helpers'
import { textBlock } from '../../lib/notion/renderers'
import getNotionUsers from '../../lib/notion/getNotionUsers'
import getBlogIndex from '../../lib/notion/getBlogIndex'

export async function getStaticProps({ preview }) {
  const postsTable = await getBlogIndex()

  const authorsToGet: Set<string> = new Set()
  const posts: any[] = Object.keys(postsTable)
    .map(slug => {
      const post = postsTable[slug]
      // remove draft posts in production
      if (!preview && !postIsPublished(post)) {
        return null
      }
      post.Authors = post.Authors || []
      for (const author of post.Authors) {
        authorsToGet.add(author)
      }
      return post
    })
    .filter(Boolean)

  const { users } = await getNotionUsers([...authorsToGet])

  posts.map(post => {
    post.Authors = post.Authors.map(id => users[id].full_name)
  })

  return {
    props: {
      preview: preview || false,
      posts,
    },
    unstable_revalidate: 10,
  }
}

export default ({ posts = [], preview }) => {
  return (
    <>
      <Header titlePre="Blog" />
      {preview && (
        <div className={blogStyles.previewAlertContainer}>
          <div className={blogStyles.previewAlert}>
            <b>Note:</b>
            {` `}Viewing in preview mode{' '}
            <Link href={`/api/clear-preview`}>
              <button className={blogStyles.escapePreview}>Exit Preview</button>
            </Link>
          </div>
        </div>
      )}
      <div className={`${sharedStyles.layout} ${blogStyles.blogIndex}`}>
        <h1>My Notion Blog</h1>
        {posts.length === 0 && (
          <p className={blogStyles.noPosts}>There are no posts yet</p>
        )}
        {posts.map(post => {
          return (
            <div className={blogStyles.postPreview} key={post.Slug}>
              <h3>
                <Link href="/blog/[slug]" as={getBlogLink(post.Slug)}>
                  <div className={blogStyles.titleContainer}>
                    {!post.Published && (
                      <span className={blogStyles.draftBadge}>Draft</span>
                    )}
                    <a>{post.Page}</a>
                  </div>
                </Link>
              </h3>
              {post.Authors.length > 0 && (
                <div className="authors">By: {post.Authors.join(' ')}</div>
              )}
              {post.Date && (
                <div className="posted">Posted: {getDateStr(post.Date)}</div>
              )}
                    
              <p>
                {(!post.preview || post.preview.length === 0) &&
                  'No preview available'}
                 {(post.preview || []).map((block, idx) => {
                    const { value } = block
                    const { type, properties } = value
                    switch (type) {
                      case 'text':
                        textBlock(block, true, `${post.Slug}${i}`)
                      break
                      case 'image':
                      case 'video':
                      case 'embed': {
                        const { format = {} } = value
                        const {
                          block_width,
                          block_height,
                          display_source,
                          block_aspect_ratio,
                        } = format
                        const baseBlockWidth = 768
                        const roundFactor = Math.pow(10, 2)
                        // calculate percentages
                        const width = block_width
                          ? `${Math.round(
                              (block_width / baseBlockWidth) * 100 * roundFactor
                            ) / roundFactor}%`
                          : block_height || '100%'

                        const isImage = type === 'image'
                        const Comp = isImage ? 'img' : 'video'
                        const useWrapper = block_aspect_ratio && !block_height
                        const childStyle: CSSProperties = useWrapper
                          ? {
                              width: '100%',
                              height: '100%',
                              border: 'none',
                              position: 'absolute',
                              top: 0,
                            }
                          : {
                              width,
                              border: 'none',
                              height: block_height,
                              display: 'block',
                              maxWidth: '100%',
                            }

                        let child = null

                        if (!isImage && !value.file_ids) {
                          // external resource use iframe
                          child = (
                            <iframe
                              style={childStyle}
                              src={display_source}
                              key={!useWrapper ? id : undefined}
                              className={!useWrapper ? 'asset-wrapper' : undefined}
                            />
                          )
                        } else {
                          // notion resource
                          child = (
                            <Comp
                              key={!useWrapper ? id : undefined}
                              src={`/api/asset?assetUrl=${encodeURIComponent(
                                display_source as any
                              )}&blockId=${id}`}
                              controls={!isImage}
                              alt={`An ${isImage ? 'image' : 'video'} from Notion`}
                              loop={!isImage}
                              muted={!isImage}
                              autoPlay={!isImage}
                              style={childStyle}
                            />
                          )
                        }
                        return useWrapper ? (
                            <div
                              style={{
                                paddingTop: `${Math.round(block_aspect_ratio * 100)}%`,
                                position: 'relative',
                              }}
                              className="asset-wrapper"
                              key={id}
                            >
                              {child}
                            </div>
                          ) : (
                           child
                          )
                      }
                    }
                })}
              </p>
            </div>
          )
        })}
      </div>
    </>
  )
}
