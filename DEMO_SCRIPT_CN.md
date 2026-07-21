# RetentionX Preliminary v1.0 演示流程

## 0:00–0:40 产品定位

RetentionX 帮助订阅业务在客户取消前识别风险、解释风险来源、安排挽留行动并记录真实结果。演示数据与历史结果均明确标注为合成黑客松数据。

## 0:40–1:30 Overview

展示客户数量、高风险客户、年度风险收入和可保护 ARR。解释三个收入指标口径不同：风险暴露、符合条件的潜在保护金额、以及只来自成功已记录结果的实际节省 ARR。

## 1:30–2:30 Customer 360

打开高风险客户，查看使用、账单、客服、反馈和账户信号。强调风险分数是透明启发式原型指标，不是经过校准的机器学习概率。

## 2:30–3:40 Action Center

从推荐创建行动，填写负责人、截止日期、状态、客户回应、结果、行动后风险、实际保护收入和备注。说明“已完成”只代表工作流结束，不代表客户已留存。

切换 Outcomes，展示留存、降级、流失、未知结果、成功率、完成时间及行动类型结果。新增行动默认保持待定。

## 3:40–4:20 Scenario Lab

比较方向性方案。指出卡片上的 “Prototype rule”、“Not causally validated” 和 “Directional estimate only”，不把估算描述为保证结果。

## 4:20–5:00 Model Transparency

在 More tools 打开 Model Transparency，选择客户，核对每个信号的数据来源、贡献分和最终总分，并说明已知限制与未来训练模型架构。

## 5:00–6:10 Multi-source Data Studio

分别展示 Account、Usage、Billing、Support 和 Feedback 五张来源卡。下载模板并导入 CSV，解释每个来源的有效行、无效行、重复记录和更新时间。然后查看 customerId 匹配、未匹配记录、缺失来源和数据完整度，再应用合并后的客户数据。

## 6:10–7:00 Customer timeline 与 Plan fit

返回 Customer 360，展示每个风险信号的数据来源和五类数据完整度。筛选 Usage、Billing、Support、Feedback 与 Retention actions 时间线。最后展示 Maintain、Onboarding、Right-size 或 Upsell 方案，并强调没有套餐目录时价格影响只是方向性估算。

## 7:00–7:30 Outcome analytics

在 Action Center 的 Outcomes 页面展示只基于已记录结果的漏斗、接受与拒绝、风险前后变化、按行动类型节省的 ARR、负责人工作量与逾期数量。数据不足时显示诚实的空状态。

## 7:30–8:20 Trained model 与 fallback

在 Model Transparency 切换到 Trained logistic model。若 `public/model/model.json` 可用，展示合成训练数据标签、特征数量与客户推理分数；若文件缺失或无效，界面明确显示 heuristic fallback。不要把合成评估指标描述为生产准确率。

## 8:20–9:10 Experiments 与 audit

创建一个包含假设、目标群体、控制组和处理组的实验。说明即使存在组间差异，系统也不会自动声称因果提升。随后查看 Audit log 中的数据导入、模型切换、行动与实验记录。

## 9:10–10:00 Campaign Simulation

编辑主题、正文和个性化 token，选择客户分群并预览。保存草稿或点击 “Mark as simulated sent”。强调当前没有邮件服务商，因此不会发送真实邮件。
