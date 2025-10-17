export default {
  index: {
    title: "Inicio",
    type: "page",
    icon: "material-symbols:home",
    href: "/es",
  },
  categories: {
    title: "Categorías",
    type: "menu",
    icon: "material-symbols:category",
    items: {
      action: {
        title: "Juegos de Acción",
        icon: "material-symbols:flash-on",
        href: "/es/games/action",
      },
      fighting: {
        title: "Ejemplo de Categoría",
        icon: "material-symbols:sports-martial-arts",
        href: "/es/games/category-1",
      },
      arcade: {
        title: "Ejemplo de Categoría",
        icon: "material-symbols:gamepad",
        href: "/es/games/category-2",
      },
    },
  },
  landing: {
    title: "Ejemplo de Landing",
    type: "page",
    icon: "material-symbols:download",
    href: "/es/landing",
  },
  guides: {
    title: "Guías",
    type: "menu",
    icon: "material-symbols:menu-book",
    items: {
      "1.getting-started": {
        title: "1.Inicio Rápido",
        href: "/es/guides/1.getting-started",
        icon: "material-symbols:rocket-launch",
      },
      "2.create-a-cloudflare-pages": {
        title: "2.Desplegar con Cloudflare Pages",
        href: "/es/guides/2.depoly-2-cloudflare-pages",
        icon: "material-symbols:cloud-upload",
      },
      "3.basic-configuration": {
        title: "3.Configuración Básica",
        href: "/es/guides/3.basic-configuration",
        icon: "material-symbols:settings",
      },
      "4.i18n": {
        title: "4.Soporte Multiidioma",
        href: "/es/guides/4.i18n",
        icon: "material-symbols:translate",
      },
      "5.menu": {
        title: "5.Configuración de Menú",
        href: "/es/guides/5.menu",
        icon: "material-symbols:menu",
      },
      "6.theme-customization": {
        title: "6.Personalización de Tema",
        href: "/es/guides/6.theme-customization",
        icon: "material-symbols:palette",
      },
    },
  },
};
