// BstContextMenu 示例的公共素材与演示组件
//
// 本文件被 `*.example.tsx` 共用：
// - 菜单数据、样式常量与 Controls 取值归一化属于「素材」，各示例按需引用；
// - `createDemo` 是唯一的演示组件实现，各示例只通过 `DemoOptions` 定制它。
//   若每个示例各写一遍外壳，28 个示例会有 28 份几乎相同的结构；
//   同时 `vue/one-component-per-file` 要求单文件单组件，也只能集中在此。
import type {
  BstContextMenuClickOutsideContext,
  BstContextMenuEscKeyDownContext,
  BstContextMenuExpose,
  BstContextMenuItem,
  BstContextMenuItemSelectContext,
  BstContextMenuPosition,
  BstContextMenuProps,
  BstContextMenuScrollOutsideContext,
} from '@binarysovereign/bst-types';
import { defineComponent, h, ref } from 'vue';
import type { CSSProperties, Slot, VNode } from 'vue';

import { BstContextMenu } from '@binarysovereign/bst-advanced-components/context-menu';

/** 常规菜单项：含左右文本与分割线 */
export const DEFAULT_ITEMS: BstContextMenuItem[] = [
  { key: 'copy', leftText: '复制', rightText: 'Ctrl+C' },
  { key: 'paste', leftText: '粘贴', rightText: 'Ctrl+V' },
  { key: 'rename', leftText: '重命名', rightText: 'F2' },
  { key: 'divider', type: 'divider' },
  { key: 'move-to', leftText: '移动到…', rightText: '>' },
];

/** 含禁用项与分割线的菜单：验证禁用态样式与不可点击行为 */
export const DISABLED_ITEMS: BstContextMenuItem[] = [
  { key: 'open', leftText: '打开' },
  { key: 'open-in-new', leftText: '在新窗口打开' },
  { key: 'divider-1', type: 'divider' },
  { key: 'cut', leftText: '剪切', rightText: 'Ctrl+X', isDisabled: true },
  { key: 'delete', leftText: '删除', rightText: 'Del', isDisabled: true },
];

/** 超出最大高度的一组长列表：验证内部滚动 */
export const MANY_ITEMS: BstContextMenuItem[] = Array.from({ length: 20 }, (_, index) => ({
  key: `item-${String(index + 1)}`,
  leftText: `菜单项 ${String(index + 1)}`,
}));

/** 仅左文本的菜单：验证无右侧文本时的布局 */
export const TEXT_ONLY_ITEMS: BstContextMenuItem[] = [
  { key: 'new', leftText: '新建' },
  { key: 'open', leftText: '打开' },
  { key: 'save', leftText: '保存' },
  { key: 'save-as', leftText: '另存为' },
];

/** 长文本：验证左侧省略号与右侧快捷键不折行 */
export const LONG_TEXT_ITEMS: BstContextMenuItem[] = [
  {
    key: 'long',
    leftText: '这是一段非常长的菜单项文本，用于验证超出面板宽度时的省略号表现是否正常',
    rightText: 'Ctrl+Shift+Alt+L',
  },
  { key: 'medium', leftText: '项目名称较长时右侧快捷键仍应保持贴右对齐', rightText: 'Alt+F4' },
  { key: 'short', leftText: '短文本', rightText: 'F5' },
];

/**
 * 异常数据：验证归一化规则
 *
 * - 重复 key 保留首次出现项；
 * - 空字符串与 `NaN` 属于非法 key，丢弃并在控制台告警；
 * - 既无左右文本也无 action 的项会渲染成空行；
 * - 分割线忽略文本与 action。
 */
export const INVALID_ITEMS: BstContextMenuItem[] = [
  { key: 'dup', leftText: '首次出现的 dup' },
  { key: 'dup', leftText: '重复的 dup 会被丢弃' },
  { key: '', leftText: '空字符串 key 会被丢弃' },
  { key: Number.NaN, leftText: 'NaN key 会被丢弃' },
  { key: 'empty' },
  { key: 'divider', type: 'divider', leftText: '分割线忽略文本', rightText: 'Ctrl+D' },
  { key: 'tail', leftText: '尾项' },
];

/** 数字 key：`key` 除字符串外还允许有限数字，且与字符串 key 共存时不冲突 */
export const NUMERIC_KEY_ITEMS: BstContextMenuItem[] = [
  { key: 1, leftText: '第一项（key: 1）' },
  { key: 2, leftText: '第二项（key: 2）', rightText: 'Ctrl+2' },
  { key: 3, type: 'divider' },
  { key: 4, leftText: '第四项（key: 4）' },
  { key: 'five', leftText: '第五项（key: “five”）' },
];

/**
 * 分割线边界：开头、连续两条、结尾各一处
 *
 * 验证分割线自身不被禁用逻辑影响，也不会因为相邻而出现双倍间距。
 */
export const DIVIDER_EDGE_ITEMS: BstContextMenuItem[] = [
  { key: 'lead-divider', type: 'divider' },
  { key: 'a', leftText: '上方有一条分割线' },
  { key: 'gap-1', type: 'divider' },
  { key: 'gap-2', type: 'divider' },
  { key: 'b', leftText: '上方有连续两条分割线' },
  { key: 'tail-divider', type: 'divider' },
];

/** `default` 插槽演示用的密度选项 */
const DENSITY_OPTIONS = [
  { order: '1', label: '紧凑', hint: 'Ctrl+1' },
  { order: '2', label: '默认', hint: 'Ctrl+2' },
  { order: '3', label: '宽松', hint: 'Ctrl+3' },
];

/** 工具栏按钮样式：与样式包令牌保持一致，不硬编码色值 */
const TOOLBAR_BUTTON_STYLE: CSSProperties = {
  padding: '4px 12px',
  border: '1px solid var(--bst-component-border)',
  borderRadius: '4px',
  background: 'var(--bst-bg-color-container)',
  color: 'var(--bst-text-color-primary)',
  cursor: 'pointer',
  fontSize: '13px',
};

/** `teleport` 单选控件的选项文案，与 `argTypes.teleport.options` 保持一致 */
export const TELEPORT_ARG_BODY = 'body（默认）';
export const TELEPORT_ARG_INLINE = '原地渲染';
export const TELEPORT_ARG_CONTAINER = '指定容器';
export const TELEPORT_ARG_MISSING = '不存在的选择器';

/** 四个 `teleport` 选项，供 `argTypes.teleport.options` 直接引用 */
export const TELEPORT_ARG_OPTIONS = [
  TELEPORT_ARG_BODY,
  TELEPORT_ARG_INLINE,
  TELEPORT_ARG_CONTAINER,
  TELEPORT_ARG_MISSING,
];

/**
 * 把 Controls 文本框里的纯数字还原成数字。
 *
 * `width` / `maxHeight` 的 TS 类型是 `number | string`，Storybook 对这种联合类型只能
 * 推断成 object 控件（只给一个 JSON 输入框）。改成 text 控件后输入恒为字符串，
 * 而组件的 `toCssLength` 只给「数字」补 `px`、字符串原样写入，
 * 因此这里把 `240` 这类纯数字还原成数字，使 Controls 的行为与代码里传 `240` 一致；
 * 空串（点了「设置字符串」但还没输入）还原成 `undefined`，回落到样式包默认值，
 * 避免触发组件的入参校验告警。
 *
 * @param value Controls 传入的原始值
 * @returns 纯数字字符串转成的数字，空串为 `undefined`，其余原样返回
 */
export const toLengthArg = (value?: number | string): number | string | undefined => {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();

  if (!trimmed) return undefined;

  return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
};

/**
 * 把 Controls 里的 `teleport` 选项文案还原成组件真正接受的取值。
 *
 * 这里不用 `argTypes.teleport.mapping`：映射后的 arg 值（`true` / `false`）不再等于选项值，
 * 单选组会回显为「一个都没选中」；改用 story 层归一化后，arg 始终是选项文案，
 * 初始态与切换后都能正确勾选。
 *
 * @param value 选项文案或代码里直接传入的真实值
 * @returns `true` / `false` / 选择器，或原样返回
 */
export const toTeleportArg = (value?: boolean | string): boolean | string | undefined => {
  if (value === TELEPORT_ARG_BODY) return true;
  if (value === TELEPORT_ARG_INLINE) return false;
  if (value === TELEPORT_ARG_CONTAINER) return '#bst-story-menu-portal';
  if (value === TELEPORT_ARG_MISSING) return '#bst-story-missing-portal';

  return value;
};

/** 工具栏按钮在视口四角打开时的越界量：故意超出视口，用于验证夹取 */
const DEMO_EDGE_INSET = 24;

/** 演示区工具栏形态 */
type DemoToolbar = 'controlled' | 'expose' | 'close' | 'edge' | 'dynamic';

/** 演示组件的扩展配置 */
export interface DemoOptions {
  /** 提示文案，默认是右键引导 */
  hint?: string;
  /** 工具栏形态：受控显隐 / 实例方法 / 手动关闭 / 视口四角 / 动态增删项 */
  toolbar?: DemoToolbar;
  /** 是否把最近事件渲染到画布上 */
  trackEvents?: boolean;
  /** 是否用 `default` 插槽完全接管菜单内容 */
  useDefaultSlot?: boolean;
  /** 是否用 `item` 插槽自定义单项渲染 */
  useItemSlot?: boolean;
  /** 是否给每项注入 `action` 回调 */
  useItemAction?: boolean;
  /** 是否渲染 Teleport 目标容器 */
  portalHost?: boolean;
  /** 是否把菜单项改为组件内可增删的副本（配合 `toolbar: 'dynamic'`） */
  dynamicItems?: boolean;
  /**
   * 额外写到演示容器上的内联样式
   *
   * 同时作为组件 CSS 变量的注入点：`--bst-context-menu-width` 等变量
   * 只有在 `teleport: false`（面板留在容器内）时才会被继承。
   */
  containerStyle?: CSSProperties;
}

/**
 * `item` 插槽的渲染：左侧换成「序号 + 状态圆点 + 文本」，右侧快捷键换成 kbd 徽标。
 *
 * 插槽只替换项内部内容，外层类名、点击与键盘行为仍由组件提供。
 *
 * @param props 组件传入的菜单项与索引
 * @returns 项内部节点
 */
const renderItemSlot = ({ item, index }: { item: BstContextMenuItem; index: number }): VNode[] => {
  const nodes: VNode[] = [
    <span class="bst-context-menu-item-left-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: item.isDisabled ? 'var(--bst-text-color-disabled)' : 'var(--bst-text-color-brand)',
        }}
      />
      {`${String(index + 1)}. ${item.leftText ?? ''}`}
    </span>,
  ];

  if (item.rightText) {
    nodes.push(
      <span class="bst-context-menu-item-right-text">
        <kbd
          style={{
            border: '1px solid var(--bst-component-border)',
            borderRadius: '4px',
            padding: '0 4px',
            fontSize: '12px',
            color: 'var(--bst-text-color-secondary)',
          }}
        >
          {item.rightText}
        </kbd>
      </span>,
    );
  }

  return nodes;
};

/**
 * 生成一份可配置的演示组件。
 *
 * 坐标通过组件暴露的 `show(x, y)` 传入，这是打开菜单并定位的标准用法：
 * 两个坐标必须同时给，组件会在首帧测量后夹取到视口内。
 * 同时保留 `v-model:is-visible` / `v-model:position`，用于验证受控绑定能同步回父级。
 *
 * @param args 组件入参，直接来自 story 的 args，因此 Controls 面板可实时调参
 * @param options 演示层配置：插槽、工具栏、事件日志等
 * @returns 可直接作为 story `render` 返回值的演示组件
 */
// 返回类型是 `defineComponent` 推导出的具体类型：显式写成宽泛的 `Component` 或
// `DefineComponent` 都不再满足 Storybook 的 `StoryFnVueReturnType`，因此保留推导
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createDemo = (args: BstContextMenuProps, options: DemoOptions = {}) =>
  defineComponent({
    name: 'BstContextMenuStoryDemo',
    setup() {
      // 初始显隐跟随入参：支持验证「挂载即显示」时的首帧测量与防闪
      const isVisible = ref(args.isVisible === true);
      const position = ref<BstContextMenuPosition>(args.position ?? { x: 0, y: 0 });
      const menuRef = ref<BstContextMenuExpose | null>(null);
      const lastSelected = ref('尚未选择');
      const eventLog = ref<string[]>([]);
      // 「动态数据」演示：菜单打开时增删菜单项，验证尺寸变化会触发重新夹取
      const liveItems = ref<BstContextMenuItem[]>([...(args.items ?? [])]);

      /**
       * 记录最近事件，最多保留 5 条。
       *
       * @param name 事件名
       * @param detail 可选补充信息
       */
      const pushEvent = (name: string, detail?: string): void => {
        eventLog.value = [detail ? `${name} · ${detail}` : name, ...eventLog.value].slice(0, 5);
      };

      /** `default` 插槽里的自定义选项被选中 */
      const selectCustom = (label: string): void => {
        lastSelected.value = label;
        pushEvent('default-slot', label);
        menuRef.value?.hide();
      };

      const handleItemSelect = (context: BstContextMenuItemSelectContext): void => {
        lastSelected.value = context.item.leftText ?? String(context.item.key);
        pushEvent('item-select', `index=${String(context.index)}`);
        args.onItemSelect?.(context);
      };

      const handleClickOutside = (context: BstContextMenuClickOutsideContext): void => {
        pushEvent('click-outside');
        args.onClickOutside?.(context);
      };

      const handleScrollOutside = (context: BstContextMenuScrollOutsideContext): void => {
        pushEvent('scroll-outside');
        args.onScrollOutside?.(context);
      };

      const handleEscKeyDown = (context: BstContextMenuEscKeyDownContext): void => {
        pushEvent('esc-key-down');
        args.onEscKeyDown?.(context);
      };

      const handleAfterEnter = (): void => {
        pushEvent('after-enter');
        args.onAfterEnter?.();
      };

      const handleAfterLeave = (): void => {
        pushEvent('after-leave');
        args.onAfterLeave?.();
      };

      /** 右键：按指针坐标打开 */
      const openAtPointer = (event: MouseEvent): void => {
        event.preventDefault();
        menuRef.value?.show(event.clientX, event.clientY);
      };

      /** 受控模式：仅改 Props，验证父级写入能否驱动内部状态 */
      const openByProps = (): void => {
        isVisible.value = true;
      };

      /** 受控模式：菜单保持打开时改坐标 */
      const shiftPosition = (): void => {
        position.value = { x: position.value.x + 40, y: position.value.y + 30 };
      };

      /**
       * 在视口四角打开菜单。
       *
       * 坐标故意向视口外溢出，用于验证面板会被夹取回视口内、完整可见。
       *
       * @param corner 左上 / 右上 / 左下 / 右下
       */
      const showAtCorner = (corner: 'tl' | 'tr' | 'bl' | 'br'): void => {
        const x = corner.endsWith('r') ? window.innerWidth - DEMO_EDGE_INSET : DEMO_EDGE_INSET;
        const y = corner.startsWith('b') ? window.innerHeight - DEMO_EDGE_INSET : DEMO_EDGE_INSET;

        menuRef.value?.show(x, y);
      };

      /**
       * 连续关闭再打开。
       *
       * 真实右键时 `mousedown` 会先关闭已打开的菜单，`contextmenu` 紧接着在新坐标重开，
       * 本按钮复现这个时序（曾经的缺陷：此时新坐标不会被夹取）。
       */
      const reopenAtBottomRight = (): void => {
        menuRef.value?.hide();
        menuRef.value?.show(window.innerWidth - DEMO_EDGE_INSET, window.innerHeight - DEMO_EDGE_INSET);
      };

      /** 追加一项：面板变高，已打开的菜单需重新夹取坐标 */
      const appendItem = (): void => {
        const index = liveItems.value.length + 1;

        liveItems.value = [
          ...liveItems.value,
          { key: `appended-${String(index)}`, leftText: `追加项 ${String(index)}` },
        ];
      };

      /** 移除末项 */
      const removeLastItem = (): void => {
        liveItems.value = liveItems.value.slice(0, -1);
      };

      /** 把动态列表恢复为 story 默认入参 */
      const resetLiveItems = (): void => {
        liveItems.value = [...(args.items ?? [])];
      };

      /** `default` 插槽：完全接管菜单内容，使用样式包类名维持原生外观 */
      const renderDefaultSlot = (): VNode[] => [
        <div style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--bst-text-color-secondary)' }}>
          视图密度（自定义内容）
        </div>,
        ...DENSITY_OPTIONS.map((option) => (
          <div
            role="menuitem"
            tabindex={0}
            class="bst-context-menu-item"
            onClick={() => selectCustom(option.label)}
            onKeydown={(event: KeyboardEvent) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;

              event.preventDefault();
              selectCustom(option.label);
            }}
          >
            <span class="bst-context-menu-item-left-text">{option.label}</span>
            {/* 自定义内容自行负责对比度：原生右文本色是 40% 黑，14px 下仅 2.84:1 */}
            <span class="bst-context-menu-item-right-text" style={{ color: 'var(--bst-text-color-secondary)' }}>
              {option.hint}
            </span>
          </div>
        )),
      ];

      /** 事件追踪模式下渲染最近事件列表 */
      const renderEventLog = () =>
        options.trackEvents ? (
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--bst-text-color-secondary)' }}>
              最近事件（最多 5 条）
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px' }}>
              {eventLog.value.length === 0 ? (
                <li>暂无事件</li>
              ) : (
                eventLog.value.map((line, index) => <li key={`${String(index)}-${line}`}>{line}</li>)
              )}
            </ul>
          </div>
        ) : null;

      /** 工具栏：受控显隐、实例方法、手动关闭、视口四角、动态增删五种形态 */
      const renderToolbar = () => {
        if (options.toolbar === 'controlled') {
          return (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" style={TOOLBAR_BUTTON_STYLE} onClick={openByProps}>
                按 Props 坐标打开
              </button>
              <button type="button" style={TOOLBAR_BUTTON_STYLE} onClick={shiftPosition}>
                坐标 +40 / +30
              </button>
            </div>
          );
        }

        if (options.toolbar === 'expose') {
          return (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" style={TOOLBAR_BUTTON_STYLE} onClick={() => menuRef.value?.show(120, 120)}>
                show(120, 120)
              </button>
              <button type="button" style={TOOLBAR_BUTTON_STYLE} onClick={() => menuRef.value?.hide()}>
                hide()
              </button>
            </div>
          );
        }

        if (options.toolbar === 'close') {
          return (
            <button type="button" style={TOOLBAR_BUTTON_STYLE} onClick={() => menuRef.value?.hide()}>
              关闭菜单
            </button>
          );
        }

        if (options.toolbar === 'edge') {
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button type="button" style={TOOLBAR_BUTTON_STYLE} onClick={() => showAtCorner('tl')}>
                左上角（越界）
              </button>
              <button type="button" style={TOOLBAR_BUTTON_STYLE} onClick={() => showAtCorner('tr')}>
                右上角（越界）
              </button>
              <button type="button" style={TOOLBAR_BUTTON_STYLE} onClick={() => showAtCorner('bl')}>
                左下角（越界）
              </button>
              <button type="button" style={TOOLBAR_BUTTON_STYLE} onClick={() => showAtCorner('br')}>
                右下角（越界）
              </button>
              <button type="button" style={TOOLBAR_BUTTON_STYLE} onClick={reopenAtBottomRight}>
                关闭后在右下重开
              </button>
            </div>
          );
        }

        if (options.toolbar === 'dynamic') {
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button type="button" style={TOOLBAR_BUTTON_STYLE} onClick={appendItem}>
                追加一项
              </button>
              <button type="button" style={TOOLBAR_BUTTON_STYLE} onClick={removeLastItem}>
                移除末项
              </button>
              <button type="button" style={TOOLBAR_BUTTON_STYLE} onClick={resetLiveItems}>
                重置列表
              </button>
            </div>
          );
        }

        return null;
      };

      return () => {
        const slots: Record<string, Slot> | undefined = options.useDefaultSlot
          ? { default: renderDefaultSlot }
          : options.useItemSlot
            ? { item: renderItemSlot }
            : undefined;

        // 逐项注入 action：验证「item-select 之后执行 action，随后自动关闭」
        const sourceItems = options.dynamicItems ? liveItems.value : (args.items ?? []);
        const items = options.useItemAction
          ? sourceItems.map((item) => ({
              ...item,
              action: (context: BstContextMenuItemSelectContext): void => {
                pushEvent('action', String(context.item.key));
              },
            }))
          : sourceItems;

        const menu = h(
          BstContextMenu,
          {
            ref: menuRef,
            items,
            width: toLengthArg(args.width),
            maxHeight: toLengthArg(args.maxHeight),
            teleport: toTeleportArg(args.teleport),
            isVisible: isVisible.value,
            position: position.value,
            isCloseOnOutsideClick: args.isCloseOnOutsideClick,
            isCloseOnOutsideScroll: args.isCloseOnOutsideScroll,
            isCloseOnEscKeyDown: args.isCloseOnEscKeyDown,
            'onUpdate:isVisible': (value: boolean) => {
              pushEvent('update:isVisible', String(value));
              isVisible.value = value;
            },
            'onUpdate:position': (value: BstContextMenuPosition) => {
              pushEvent('update:position', `x=${String(Math.round(value.x))} y=${String(Math.round(value.y))}`);
              position.value = value;
            },
            onItemSelect: handleItemSelect,
            onClickOutside: handleClickOutside,
            onScrollOutside: handleScrollOutside,
            onEscKeyDown: handleEscKeyDown,
            onAfterEnter: handleAfterEnter,
            onAfterLeave: handleAfterLeave,
          },
          slots,
        );

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 工具栏置于演示区上方：菜单在演示区内弹出，不会遮挡按钮 */}
            {renderToolbar()}

            {/* Teleport 目标必须先于菜单挂载，否则选择器解析不到 */}
            {options.portalHost && (
              <div
                id="bst-story-menu-portal"
                style={{
                  padding: '8px',
                  border: '1px dashed var(--bst-component-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--bst-text-color-secondary)',
                }}
              >
                Teleport 容器（菜单会渲染在此元素内）
              </div>
            )}

            <div
              class="bst-story-context-menu-demo"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minHeight: '260px',
                // 以下取值全部来自样式包的真实令牌，主题切换时随之变化
                border: '1px dashed var(--bst-component-border)',
                borderRadius: '8px',
                background: 'var(--bst-bg-color-container)',
                // 用 secondary 而非 placeholder：placeholder 是 40% 黑，对白底仅 2.84:1，
                // 不满足 WCAG AA 的 4.5:1；secondary 为 60% 黑，约 5.7:1
                color: 'var(--bst-text-color-secondary)',
                fontSize: '14px',
                userSelect: 'none',
                // CSS 变量注入点：仅在 `teleport: false` 时面板会继承
                ...options.containerStyle,
              }}
              onContextmenu={openAtPointer}
            >
              <p style={{ margin: 0 }}>{options.hint ?? '在此区域内右键打开菜单'}</p>
              <p style={{ margin: 0 }}>最近选择：{lastSelected.value}</p>
              {menu}
            </div>

            {renderEventLog()}
          </div>
        );
      };
    },
  });
