import { Component, createSignal, For } from 'solid-js';
import { IMatch } from '../../../common';
import { createFetcher } from '../utils/fetcher';
import { t } from '../utils/locale';
import { onEnter } from '../utils/onEnter';
import { Card } from './Card';

export const Rcon: Component<{
	match: IMatch;
}> = (props) => {
	const fetcher = createFetcher(props.match.tmtSecret);
	const execRcon = async (command: string) => {
		setHistory([command, ...history()].filter((v, i, arr) => arr.indexOf(v) === i));
		setHistoryIndex(-1);
		setNotSent('');
		const response = await fetcher<string[]>(
			'POST',
			`/api/matches/${props.match.id}/server/rcon`,
			[command]
		);
		if (response) {
			setOutput([...output(), command, ...response]);
		} else {
			setOutput([...output(), command, 'error']);
		}
	};
	const [output, setOutput] = createSignal<string[]>([]);
	const [history, setHistory] = createSignal<string[]>([]);
	const [historyIndex, setHistoryIndex] = createSignal(-1);
	const [notSent, setNotSent] = createSignal('');

	const saveNotSent = (value: string) => {
		if (historyIndex() === -1) {
			setNotSent(value);
		}
	};

	return (
		<Card>
			<h2 class="font-bold text-lg">{t('Rcon')}</h2>
			<div class="h-80 overflow-scroll text-left flex flex-col-reverse bg-gray-50">
				<div>
					<For each={output()}>
						{(line) => (
							<>
								{line
									.trim()
									.split('\n')
									.map((l) => (
										<>
											{l}
											<br />
										</>
									))}
							</>
						)}
					</For>
					<br />
				</div>
			</div>
			<input
				class="w-full"
				type="text"
				onKeyDown={onEnter(
					(e) => {
						const command = e.currentTarget.value.trim();
						if (command) {
							execRcon(command);
							e.currentTarget.value = '';
						}
					},
					(e) => {
						if (e.key === 'ArrowUp') {
							saveNotSent(e.currentTarget.value);
							setHistoryIndex(Math.min(history().length - 1, historyIndex() + 1));
							e.currentTarget.value = history()[historyIndex()];
							e.preventDefault();
						} else if (e.key === 'ArrowDown') {
							saveNotSent(e.currentTarget.value);
							setHistoryIndex(Math.max(-1, historyIndex() - 1));
							e.currentTarget.value = history()[historyIndex()] ?? notSent();
							e.preventDefault();
						}
					}
				)}
				placeholder={t('Execute rcon command...')}
			/>
		</Card>
	);
};
