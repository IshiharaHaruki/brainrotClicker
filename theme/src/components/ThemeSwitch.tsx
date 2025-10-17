import { useTheme } from 'next-themes'
import { useMounted } from 'nextra/hooks'
import { Icon } from '@iconify/react'

interface ThemeSwitchProps {
    className?: string
    lite?: boolean
}

export function ThemeSwitch({ className, lite }: ThemeSwitchProps) {
    const { setTheme, resolvedTheme, theme = '' } = useTheme()
    const mounted = useMounted()

    return (
        <button
            className={`p-2 text-gray-500 hover:text-[#81c869] transition-colors ${className}`}
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            title="切换主题"
        >
            {mounted && (
                <Icon 
                    icon={resolvedTheme === 'dark' 
                        ? "material-symbols:dark-mode" 
                        : "material-symbols:light-mode"
                    } 
                    className="w-5 h-5"
                />
            )}
        </button>
    )
} 