// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserMentionKeys} from 'mattermost-redux/selectors/entities/users';

import {getEmojiMap} from 'selectors/emojis';

import {getSiteURL} from 'utils/url.jsx';

import PostMarkdown from './post_markdown';

function mapStateToProps(state, ownProps) {
    return {
        channelNamesMap: getChannelsNameMapInCurrentTeam(state),
        emojis: getEmojiMap(state),
        mentionKeys: ownProps.mentionKeys || getCurrentUserMentionKeys(state),
        siteURL: getSiteURL(),
        team: getCurrentTeam(state)
    };
}

export default connect(mapStateToProps)(PostMarkdown);
