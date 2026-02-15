import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "公告",

	// 公告内容
	content: "欢迎来到我的博客！我们与熵的小站合作啦，快去看看他的小站吧！",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "去看看",
		// 链接 URL
		url: "https://www.nekt.qzz.io/",
		// 内部链接
		// false = 站内跳转 (SPA 路由)
		// true = 打开新标签页
		external: true,
	},
};
