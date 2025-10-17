import * as React from 'react'
import { DefaultLayout } from './default'
import { LandingLayout } from './landing'
import { CategoryLayout } from "./category";
import { FeaturedLayout } from './featured'
import { AllGamesLayout } from './all-games'
import type { LayoutProps } from '../types'

type LayoutComponent = (props: LayoutProps) => React.ReactElement
type Layouts = { [key: string]: LayoutComponent }

export const layouts: Layouts = {
  default: DefaultLayout,
  landing: LandingLayout,
  category: CategoryLayout,
  featured: FeaturedLayout,
  'all-games': AllGamesLayout,
};