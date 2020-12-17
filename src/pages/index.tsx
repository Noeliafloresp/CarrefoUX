import Link from 'next/link'
import Header from '../components/header'
import ExtLink from '../components/ext-link'
import Features from '../components/features'
import GitHub from '../components/svgs/github'
import sharedStyles from '../styles/shared.module.css'

export default () => (
  <>
    <Header titlePre="Home" />
    <div className={sharedStyles.layout}>
      <img
        src="/carrefour.svg"
        height="85"
        width="250"
        alt="CarrefoUX"
      />
      <h1>CarrefoUX Blog</h1>
      <h2>
        Espacio de discursión del Departamento de UX
      </h2>
    </div>
  </>
)
