import React, { createContext, useContext, useState } from 'react'

interface MenuContextType {
  isHeroMenuOpen: boolean
  setIsHeroMenuOpen: (open: boolean) => void
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [isHeroMenuOpen, setIsHeroMenuOpen] = useState(false)
  return (
    <MenuContext.Provider value={{ isHeroMenuOpen, setIsHeroMenuOpen }}>
      {children}
    </MenuContext.Provider>
  )
}

export const useMenu = () => {
  const context = useContext(MenuContext)
  if (!context) throw new Error('useMenu must be used within MenuProvider')
  return context
}
