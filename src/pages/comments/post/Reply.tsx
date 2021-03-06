import React from "react";
import { InjectedTranslateProps, translate } from "react-i18next";

import { connect } from "react-redux";
import { Action, Dispatch, bindActionCreators } from "redux";

import { comment } from "common/reddit-api";
import { returnOf } from "common/util";
import { receiveMoreComments } from "data/reddit";

import { ActionList } from "../ActionList";
import style from "./Reply.scss";

@translate("reply")
class Reply extends React.Component<ReplyProps & ReduxProps, ReplyState> {
	state = {
		error: "",
		loading: false,
		text: ""
	};

	onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.setState({ text: e.target.value });
	};

	onClickSave = async () => {
		const { modhash, onClose, linkId, parentId, t } = this.props;
		let error = "";
		this.setState({ error, loading: true });

		try {
			const data = await comment(
				modhash,
				parentId,
				this.state.text
			).toPromise();
			this.props.receiveMoreComments({
				comments: [data],
				id: "",
				linkId,
				parentId,
				prepend: true
			});
		} catch (err) {
			console.log(err);
			error = typeof err === "string" ? err : t!("unknownError");
		}

		this.setState({ error, loading: false });
		if (!error) onClose();
	};

	render() {
		const t = this.props.t!;

		return (
			<div className={style.reply}>
				<textarea onChange={this.onChange} value={this.state.text} />

				<ActionList>
					<button onClick={this.onClickSave}>{t("save")}</button>
					<button onClick={this.props.onClose}>{t("cancel")}</button>
					{this.state.error ? (
						<p className={style.error}>{this.state.error}</p>
					) : null}
					{this.state.loading ? <p>{t("submitting")}</p> : null}
				</ActionList>
			</div>
		);
	}
}

export interface ReplyProps extends InjectedTranslateProps {
	linkId: string;
	modhash: string;
	onClose: () => void;
	parentId: string;
}

interface ReplyState {
	error: string;
	loading: boolean;
	text: string;
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) =>
	bindActionCreators(
		{
			receiveMoreComments
		},
		dispatch
	);

type ReduxProps = typeof DispatchProps;
const DispatchProps = returnOf(mapDispatchToProps);

const ConnectedReply = connect<{}, typeof DispatchProps, ReplyProps>(
	null,
	mapDispatchToProps
)(Reply);
export { ConnectedReply as Reply };
