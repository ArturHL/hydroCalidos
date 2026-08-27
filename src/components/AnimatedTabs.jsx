import { motion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1]

// Tabs con indicador deslizante — reemplaza el subrayado estático que
// duplicaban Conciliación y Contrato por una sola versión animada y
// consistente en todo el sistema.
function AnimatedTabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={active === tab.id ? 'active' : ''}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {active === tab.id && (
            <motion.div
              className="tabs-indicator"
              layoutId="tabs-indicator"
              transition={{ duration: 0.28, ease: EASE }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

export default AnimatedTabs
