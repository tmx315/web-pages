import type { FriendLink, FriendsPageConfig } from "../types/config";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
	// 显示列数：2列或3列
	columns: 3,
};

// 友链配置
export const friendsConfig: FriendLink[] = [
	{
		title: "孟轩网的小站",
		imgurl: "https://www.mxw2024.top/favicon.ico",
		desc: "一个简洁、美观、纯净、无广告的小站",
		siteurl: "https://www.mxw2024.top/",
		tags: ["官方"],
		weight: 999, // 权重，数字越大排序越靠前
		enabled: true, // 是否启用
	},
	{
		title: "熵",
		imgurl: "https://www.nekt.qzz.io/head.png",
		desc: "世界本就浑浊，罪与爱同歌",
		siteurl: "https://www.nekt.qzz.io/",
		tags: ["合作"],
		weight: 998,
		enabled: true,
	},
	{
		title: "晚梦云科技官网",
		imgurl: "https://wmy2025.cn/wmykj.png",
		desc: "晚梦云科技工作室成立于2022年是，河南省林州市领先的软件开发团队，专注于为企业提供定制软件开发、移动应用开发和大数据分析服务。",
		siteurl: "https://wmy2025.cn/",
		tags: ["友情"],
		weight: 8,
		enabled: true,
	},
	{
		title: "石猫博客",
		imgurl: "https://www.vidlii.net/usfi/avt/1HH5cpvb235.jpg",
		desc: "一只石头做的猫",
		siteurl: "http://imshimao.com/",
		tags: ["友情"],
		weight: 7,
		enabled: true,
	},
	{
		title: "CCWMORAN慕然科技",
		imgurl: "https://gpo.saobby.com/i/XlQ1PmuU5UPnej02.webp",
		desc: "CCW共创世界CCWMORAN慕然科技官网",
		siteurl: "https://ccwmoran.github.io",
		tags: ["友情"],
		weight: 6,
		enabled: true,
	},
	{
		title: "Inalineの小站",
		imgurl:
			"https://inaline.net/usr/themes/inaline/assets/images/logo/cover.png",
		desc: "此情可待成追忆，只是当时已惘然",
		siteurl: "https://inaline.net",
		tags: ["友情"],
		weight: 5,
		enabled: true,
	},
	{
		title: "Zhouyi's Blog",
		imgurl: "https://avatars.githubusercontent.com/u/160443385",
		desc: "用文字和代码,把平凡的日子折腾出光",
		siteurl: "https://zhouyi.blog",
		tags: ["友情"],
		weight: 4,
		enabled: true,
	},
	{
		title: "SAKURAIN TEAM",
		imgurl: "https://sakurain.net/image/logo.webp",
		desc: "用代码构建未来",
		siteurl: "https://sakurain.net/",
		tags: ["友情"],
		weight: 3,
		enabled: true,
	},
	{
		title: "白荼日记",
		imgurl: "https://www.ittoolman.top/images/avatar.png",
		desc: "没有什么可以留住，除了死亡。",
		siteurl: "https://blog.iletter.top/",
		tags: ["友情"],
		weight: 2,
		enabled: true,
	},
	{
		title: "Weiwei's blog",
		imgurl:
			"https://www.lov3u.top/wp-content/uploads/2026/02/Screenshot_20251221_094851_compressed_1769957339168.jpg",
		desc: "耐心是生活的关键",
		siteurl: "https://www.lov3u.top/",
		tags: ["友情"],
		weight: 1,
		enabled: true,
	},
];

// 获取启用的友链并按权重排序
export const getEnabledFriends = (): FriendLink[] => {
	return friendsConfig
		.filter((friend) => friend.enabled)
		.sort((a, b) => b.weight - a.weight);
};
