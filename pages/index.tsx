import { useEffect } from 'react'
import { useRouter } from 'nextra/hooks'
import themeConfig from '../theme.config'

export default function Index() {
    const router = useRouter()
    
    // 获取默认语言
    const defaultLocale = themeConfig?.i18n?.config?.find((l: { isDefault: boolean }) => l.isDefault)?.locale || 'en'

    useEffect(() => {
        router.replace(`/${defaultLocale}`)
    }, [router, defaultLocale])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    )
} 