export default {
  index: {
    title: "Home",
    type: "page",
    icon: "material-symbols:home",
    href: "/en",
  },
  categories: {
    title: "分类",
    type: "menu",
    icon: "material-symbols:category",
    items: {
      action: {
        title: "动作游戏",
        icon: "material-symbols:flash-on",
        href: "/zh/games/action",
      },
      fighting: {
        title: "分类页面示例",
        icon: "material-symbols:sports-martial-arts",
        href: "/zh/games/category-1",
      },
      arcade: {
        title: "分类页面示例",
        icon: "material-symbols:gamepad",
        href: "/zh/games/category-2",
      },
    },
  },
  landing: {
    title: " Landing 布局示例",
    type: "page",
    icon: "material-symbols:download",
    href: "/en/landing",
  },
  guides: {
    title: "指南",
    type: "menu",
    icon: "material-symbols:menu-book",
    items: {
      "1.getting-started": {
        title: "1.快速开始",
        href: "/en/guides/1.getting-started",
        icon: "material-symbols:rocket-launch",
      },
      "2.create-a-cloudflare-pages": {
        title: "2.使用 Cloudflare Pages 部署项目",
        href: "/en/guides/2.depoly-2-cloudflare-pages",
        icon: "material-symbols:cloud-upload",
      },
      "3.basic-configuration": {
        title: "3.基础配置",
        href: "/en/guides/3.basic-configuration",
        icon: "material-symbols:settings",
      },
      "4.i18n": {
        title: "4.多语言支持",
        href: "/en/guides/4.i18n",
        icon: "material-symbols:translate",
      },
      "5.menu": {
        title: "5.菜单配置说明",
        href: "/en/guides/5.menu",
        icon: "material-symbols:menu",
      },
      "6.theme-customization": {
        title: "6.主题定制",
        href: "/en/guides/6.theme-customization",
        icon: "material-symbols:palette",
      },
    },
  },
};
