import type { FriendLink, FriendsPageConfig } from "../types/config";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
	// 显示列数：2列或3列
	columns: 3,

	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// 是否显示底部自定义内容（friends.mdx 中的内容）
	showCustomContent: true,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否开启随机排序配置，如果开启，就会忽略权重，构建时进行一次随机排序
	randomizeSort: false,
};

// 友链配置
export const friendsConfig: FriendLink[] = [
	{
		title: "孟轩网的小站",
		imgurl: "https://www.mxw2024.top/favicon.ico",
		desc: "一个简洁、美观、纯净、无广告的小站",
		siteurl: "https://www.mxw2024.top/",
		tags: ["官方"],
		weight: 9999,
		enabled: true,
	},
	{
		title: "晚梦云科技官网",
		imgurl: "https://wmy2025.cn/logo.png",
		desc: "晚梦云科技工作室成立于2022年是，河南省林州市领先的软件开发团队，专注于为企业提供定制软件开发、移动应用开发和大数据分析服务。",
		siteurl: "https://wmy2025.cn/",
		tags: ["合作"],
		weight: 7,
		enabled: true,
	},
	{
		title: "逆云科技",
		imgurl: "https://www.mxw2024.top/img/niyun.jpg",
		desc: "上海逆云企业有限公司成立于2019年，是一家专注于云游戏技术研发与服务的科技公司。公司致力于为游戏开发商和运营商提供稳定、高效的云游戏解决方案，帮助客户降低游戏运营成本，提升用户体验。",
		siteurl: "https://www.niyunkeji.top",
		tags: ["合作"],
		weight: 9998,
		enabled: true,
	},
	{
		title: "熵",
		imgurl: "https://www.nekt.qzz.io/head.png",
		desc: "世界本就浑浊，罪与爱同歌",
		siteurl: "https://www.nekt.qzz.io/",
		tags: ["合作"],
		weight: 9997,
		enabled: true,
	},
	{
		title: "Pr06a61y's Blog",
		imgurl: "",
		desc: "存活在互联网边缘...",
		siteurl: "https://329817.xyz",
		tags: ["友情"],
		weight: 21,
		enabled: true,
	},
	{
		title: "涵云社区",
		imgurl: "https://www.hanyor.com/view/img/logo.png",
		desc: "涵云社区是一个集知识分享、互动交流和知识问答于一体的综合性在线社区平台",
		siteurl: "https://www.hanyor.com/",
		tags: ["友情"],
		weight: 20,
		enabled: true,
	},
	{
		title: "小何博客",
		imgurl:
			"https://小何.top/wp-content/uploads/2026/01/1769857787-IMG_20260131_170740.png",
		desc: "abab",
		siteurl: "https://小何.top/",
		tags: ["友情"],
		weight: 18,
		enabled: true,
	},
	{
		title: "蜜窠工作室",
		imgurl: "https://i2.qyimage.store:2999/i/210331c367084f6f",
		desc: "专注MC内容制作与网站软件开发",
		siteurl: "http://www.fgy.zhizhi.eu.org/",
		tags: ["友情"],
		weight: 17,
		enabled: true,
	},
	{
		title: "椰汁の小站",
		imgurl: "https://avatars.githubusercontent.com/u/202359413?v=4&size=64",
		desc: "欢迎访问",
		siteurl: "https://chch.dpdns.org/",
		tags: ["友情"],
		weight: 16,
		enabled: true,
	},
	{
		title: "CCWMORAN慕然科技",
		imgurl: "https://gpo.saobby.com/i/XlQ1PmuU5UPnej02.webp",
		desc: "愿你在峥嵘长青的世界里热忱不息",
		siteurl: "https://ccwmoran.pages.dev",
		tags: ["友情"],
		weight: 15,
		enabled: true,
	},
	{
		title: "幽默的小刘吖博客",
		imgurl: "https://blog.lzch.top/favicon.png",
		desc: "每天分享不一样的知识内容",
		siteurl: "https://blog.lzch.top",
		tags: ["友情"],
		weight: 14,
		enabled: true,
	},
	{
		title: "六六云计算",
		imgurl: "https://idc.llvps.cn/upload/a.png",
		desc: "便宜云服务器，挂机宝全在这",
		siteurl: "https://idc.llvps.cn/",
		tags: ["友情"],
		weight: 13,
		enabled: true,
	},
	{
		title: "Stellar Dimension 恒星维度",
		imgurl: "https://www.steldim.cn/logo.png",
		desc: "专注于网络信息技术、AI、大数据、云存储等解决方案。",
		siteurl: "https://www.steldim.cn/",
		tags: ["友情"],
		weight: 12,
		enabled: true,
	},
	{
		title: "Lucas的小博客",
		imgurl: "https://pic1.imgdb.cn/item/68fe309a3203f7be00a0c198.png",
		desc: "欲买桂花同载酒，终不似，少年游",
		siteurl: "https://blog.lris625.top/",
		tags: ["友情"],
		weight: 11,
		enabled: true,
	},
	{
		title: "openaether",
		imgurl: "https://img.openaether.cn/img/699c809821489_1771864216.png",
		desc: "吴钧泽的博客",
		siteurl: "https://openaether.cn",
		tags: ["友情"],
		weight: 10,
		enabled: true,
	},
	{
		title: "huajibenjiの笔记",
		imgurl: "https://blog.alittlehuaji.top/upload/mygo.png",
		desc: "Ciallo～(∠・ω< )⌒★",
		siteurl: "https://blog.alittlehuaji.top/",
		tags: ["友情"],
		weight: 9,
		enabled: true,
	},
	{
		title: "傲雪の",
		imgurl: "https://obb.cc.cd/assets/favicon/1.ico",
		desc: "无聊的一天搭配神经的我",
		siteurl: "https://b.oxue.de",
		tags: ["友情"],
		weight: 8,
		enabled: true,
	},
	{
		title: "miyo建站",
		imgurl: "https://nos.netease.com/ysf/7a157d315551eb6338f24a947e60cf20.jpg",
		desc: "无需服务器和域名，快速生成可访问站点",
		siteurl: "https://miyo.hyperspark.cn",
		tags: ["友情"],
		weight: 7,
		enabled: true,
	},
	{
		title: "石猫博客",
		imgurl: "https://www.vidlii.net/usfi/avt/1HH5cpvb235.jpg",
		desc: "一只石头做的猫",
		siteurl: "http://imshimao.com/",
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

// 获取启用的友链并进行排序
export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
