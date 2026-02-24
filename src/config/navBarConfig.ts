import {
	LinkPreset,
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/config";
import { siteConfig } from "./siteConfig";

// 根据页面开关动态生成导航栏配置
const getDynamicNavBarConfig = (): NavBarConfig => {
	// 基础导航栏链接
	const links: (NavBarLink | LinkPreset)[] = [
		// 主页
		LinkPreset.Home,

		// 归档
		LinkPreset.Archive,
	];

	// 自定义导航栏链接,并且支持多级菜单
	links.push({
		name: "链接",
		url: "/links/",
		icon: "material-symbols:link",

		// 子菜单
		children: [
			{
				name: "官网首页",
				url: "https://www.mxw2024.top/",
				external: true,
				icon: "material-symbols:home-app-logo",
			},
			{
				name: "下载站",
				url: "https://down.mxw2024.top/",
				external: true,
				icon: "icons8:download",
			},
			{
				name: "网页游戏",
				url: "https://game.mxw2024.top/",
				external: true,
				icon: "gis:3dtiles-web",
			},
			{
				name: "GitHub加速",
				url: "https://down.mxw.xx.kg/",
				external: true,
				icon: "mdi:github",
			},
			{
				name: "快手",
				url: "https://www.kuaishou.com/profile/3xa88be8mg3z6zq",
				external: true,
				icon: "arcticons:kwai",
			},
			{
				name: "Bilibili",
				url: "https://space.bilibili.com/3546739235621793",
				external: true,
				icon: "fa7-brands:bilibili",
			},
			{
				name: "GitHub",
				url: "https://www.github.com/tmx315",
				external: true,
				icon: "line-md:github-twotone",
			},
			{
				name: "熵的小站",
				url: "https://www.nekt.qzz.io/",
				external: true,
				icon: "material-symbols:attach-file-rounded",
			},
		],
	});

	// 友链
	links.push(LinkPreset.Friends);

	// 根据配置决定是否添加留言板，在siteConfig关闭pages.guestbook时导航栏不显示留言板
	if (siteConfig.pages.guestbook) {
		links.push(LinkPreset.Guestbook);
	}

	// 关于及其子菜单
	links.push({
		name: "关于",
		url: "/content/",
		icon: "material-symbols:info",
		children: [
			// 根据配置决定是否添加赞助，在siteConfig关闭pages.sponsor时导航栏不显示赞助
			...(siteConfig.pages.sponsor ? [LinkPreset.Sponsor] : []),

			// 关于页面
			LinkPreset.About,

			// 根据配置决定是否添加番组计划，在siteConfig关闭pages.bangumi时导航栏不显示番组计划
			...(siteConfig.pages.bangumi ? [LinkPreset.Bangumi] : []),
		],
	});

	// 仅返回链接，其它导航搜索相关配置在模块顶层常量中独立导出
	return { links } as NavBarConfig;
};

// 导航搜索配置
export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();
