# 本轮新增产品模型

- Panthera HT：高擎动力官方 ROS2 仓库 URDF/STL，含夹爪。模型转换时按官方产品照片恢复金属和黑色配色，并设置展示姿态。
- OriginBot：古月居官方 originbot_desktop URDF/STL，选用带激光雷达的导航版。按官方照片补绿色车架/轮毂、黑色轮胎和雷达、蓝色电池及金属接口。
- TonyPi Pro：pab47/TonyPi 社区仿真网格。仓库作者注明由 Salvador Echeveste 根据幻尔提供的 STP 制作。公开文件是简化的可视外壳网格，保留完整人形结构，但不是原始 CAD 的孔位、螺丝和薄板细节。图鉴明确标注“社区仿真网格（简化细节）”。黑白配色及镜头、胸前标记根据官网照片补充。

TonyPi 的原始精细 STP 暂未从幻尔公开下载资料中取得。若后续取得，可通过现有 CAD 转换流程替换 tonypi.glb，无需改动三消规则。

## 原始来源

- https://github.com/HighTorque-Robotics/Panthera-HT_ROS2
- https://github.com/guyuehome/originbot_desktop
- https://github.com/pab47/TonyPi
- https://www.hiwonder.com/products/tonypi

本轮模型均进入图鉴和第三关；第二关维持指定七种产品，第一关维持四种、十二件。

## 2026-10-02 additions
- Milk-bottle robot: user supplied `夹爪奶瓶.stp` (334 MB). Tessellated with OpenCascade, simplified for the browser, colored red/black using the supplied reference. It is the provided CAD geometry.
- PrimeBOT Q1: official Q1 V3 URDF from https://dev.primebot.com/download, downloaded from `https://csdn-tos.primebot.com/qiyuan/2026/09/24/70056d2506d74ca7a8287a078cd6e7be.zip`. Preserved real link hierarchy; white body, dark face and joints, luminous eyes.
- PrimeBOT T1: official URDF from the same download page, archive `https://csdn-tos.primebot.com/qiyuan/2026/09/24/eb05fee7baa144b2a09843220d4676d6.zip`. Pink shell, black contact parts. Animation is a game presentation using real model joints, not a deployable robot control trajectory.
- OriginBot rebuilt from its official URDF with articulated wheels. Mini Pi Plus uses its existing original URDF leg and arm hierarchy.
- RTX 5090: detailed community model identified at https://sketchfab.com/3d-models/nvidia-rtx-5090-founders-edition-free-download-29f1a4fc0b714bcc837d7f78ddd28e9b (mistjs, CC BY-NC), but download endpoint requires login. No substitute geometry inserted; awaiting a downloadable model.
- Background track: audio extracted from user's supplied Glue Rap MP4, AAC 128 kb/s, loudness normalized. Local file `assets/audio/glue-rap.m4a`, embedded in the standalone HTML. No lyrics transcribed or added to the UI.
- Title options generated with built-in imagegen. Prompts and descriptions are in `assets/titles/设计说明与提示词.md`.
