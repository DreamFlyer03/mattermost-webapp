// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import UserStore from 'stores/user_store.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import SearchResultsHeader from '../search_results_header';
import SearchResultsItem from '../search_results_item.jsx';

export default class SearchResults extends React.PureComponent {
    static propTypes = {
        results: PropTypes.array,
        channels: PropTypes.object,
        searchTerms: PropTypes.string,
        isFlaggedByPostId: PropTypes.object,
        loading: PropTypes.bool,
        compactDisplay: PropTypes.bool,
        useMilitaryTime: PropTypes.bool.isRequired,
        toggleSize: PropTypes.func,
        shrink: PropTypes.func,
        isMentionSearch: PropTypes.bool,
        isFlaggedPosts: PropTypes.bool,
        isPinnedPosts: PropTypes.bool,
        channelDisplayName: PropTypes.string.isRequired,
        selectPost: PropTypes.func
    };

    constructor(props) {
        super(props);

        this.state = {
            windowWidth: Utils.windowWidth(),
            windowHeight: Utils.windowHeight(),
            profiles: JSON.parse(JSON.stringify(UserStore.getProfiles())),
            isBusy: WebrtcStore.isBusy(),
            statuses: Object.assign({}, UserStore.getStatuses())
        };
    }

    componentDidMount() {
        UserStore.addChangeListener(this.onUserChange);
        UserStore.addStatusesChangeListener(this.onStatusChange);
        WebrtcStore.addBusyListener(this.onBusy);

        this.resize();
        window.addEventListener('resize', this.handleResize);
        if (!Utils.isMobile()) {
            $('.sidebar--right .search-items-container').perfectScrollbar();
        }
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.onUserChange);
        UserStore.removeStatusesChangeListener(this.onStatusChange);
        WebrtcStore.removeBusyListener(this.onBusy);

        window.removeEventListener('resize', this.handleResize);
    }

    componentDidUpdate(prevProps) {
        if (this.props.searchTerms !== prevProps.searchTerms) {
            this.resize();
        }
    }

    handleResize = () => {
        this.setState({
            windowWidth: Utils.windowWidth(),
            windowHeight: Utils.windowHeight()
        });
    }

    onUserChange = () => {
        this.setState({profiles: JSON.parse(JSON.stringify(UserStore.getProfiles()))});
    }

    onBusy = (isBusy) => {
        this.setState({isBusy});
    }

    onStatusChange = () => {
        this.setState({statuses: Object.assign({}, UserStore.getStatuses())});
    }

    resize = () => {
        $('#search-items-container').scrollTop(0);
    }

    render() {
        const results = this.props.results;
        const noResults = (!results || results.length === 0);
        const searchTerms = this.props.searchTerms;
        const profiles = this.state.profiles || {};
        const flagIcon = Constants.FLAG_ICON_SVG;

        let ctls = null;

        if (this.props.loading) {
            ctls =
            (
                <div className='sidebar--right__subheader'>
                    <div className='sidebar--right__loading'>
                        <i className='fa fa-spinner fa-spin'/>
                        <FormattedMessage
                            id='search_header.loading'
                            defaultMessage='Searching...'
                        />
                    </div>
                </div>
            );
        } else if (this.props.isFlaggedPosts && noResults) {
            const tips = [
                <li key='pin1'>
                    <FormattedMessage
                        id='search_results.usageFlag1'
                        defaultMessage="You haven't flagged any messages yet."
                    />
                </li>,
                <li key='pin2'>
                    <FormattedMessage
                        id='search_results.usageFlag2'
                        defaultMessage='You can add a flag to messages and comments by clicking the '
                    />
                    <span
                        className='usage__icon'
                        dangerouslySetInnerHTML={{__html: flagIcon}}
                    />
                    <FormattedMessage
                        id='search_results.usageFlag3'
                        defaultMessage=' icon next to the timestamp.'
                    />
                </li>,
                <li key='pin3'>
                    <FormattedMessage
                        id='search_results.usageFlag4'
                        defaultMessage='Flags are a way to mark messages for follow up. Your flags are personal, and cannot be seen by other users.'
                    />
                </li>
            ];

            if (global.window.mm_config.DataRetentionEnableMessageDeletion === 'true') {
                tips.push(
                    <li>
                        <FormattedMessage
                            id='search_results.usage.dataRetention'
                            defaultMessage='Only messages posted in the last {days} days are returned. Contact your System Administrator for more detail.'
                            values={{
                                days: global.window.mm_config.DataRetentionMessageRetentionDays
                            }}
                        />
                    </li>
                );
            }

            ctls = (
                <div className='sidebar--right__subheader'>
                    <ul>
                        {tips}
                    </ul>
                </div>
            );
        } else if (this.props.isPinnedPosts && noResults) {
            const tips = [
                <li key='pin1'>
                    <FormattedMessage
                        id='search_results.usagePin1'
                        defaultMessage='There are no pinned messages yet.'
                    />
                </li>,
                <li key='pin2'>
                    <FormattedMessage
                        id='search_results.usagePin2'
                        defaultMessage='All members of this channel can pin important or useful messages.'
                    />
                </li>,
                <li key='pin3'>
                    <FormattedMessage
                        id='search_results.usagePin3'
                        defaultMessage='Pinned messages are visible to all channel members.'
                    />
                </li>,
                <li key='pin4'>
                    <FormattedMessage
                        id='search_results.usagePin4'
                        defaultMessage={'To pin a message: Go to the message that you want to pin and click [...] > "Pin to channel".'}
                    />
                </li>
            ];

            if (global.window.mm_config.DataRetentionEnableMessageDeletion === 'true') {
                tips.push(
                    <li>
                        <FormattedMessage
                            id='search_results.usage.dataRetention'
                            defaultMessage='Only messages posted in the last {days} days are returned. Contact your System Administrator for more detail.'
                            values={{
                                days: global.window.mm_config.DataRetentionMessageRetentionDays
                            }}
                        />
                    </li>
                );
            }

            ctls = (
                <div className='sidebar--right__subheader'>
                    <ul>
                        {tips}
                    </ul>
                </div>
            );
        } else if (!searchTerms && noResults) {
            const tips = [
                <li key='quotes'>
                    <FormattedMessage
                        id='search_results.usage.phrasesSuggestion'
                        defaultMessage='Use {quotationMarks} to search for phrases'
                        values={{
                            quotationMarks: (
                                <b>
                                    <FormattedMessage
                                        id='search_results.usage.phrasesSuggestion.quotationMarks'
                                        defaultMessage='"quotation marks"'
                                    />
                                </b>
                            )
                        }}
                    />
                </li>,
                <li key='fromIn'>
                    <FormattedMessage
                        id='search_results.usage.fromInSuggestion'
                        defaultMessage='Use {fromUser} to find posts from specific users and {inChannel} to find posts in specific channels'
                        values={{
                            fromUser: 'from:',
                            inChannel: 'in:'
                        }}
                    />
                </li>
            ];

            ctls = (
                <div className='sidebar--right__subheader'>
                    <ul>
                        {tips}
                    </ul>
                </div>
            );
        } else if (noResults) {
            const tips = [
                <li key='partialPhrase'>
                    <FormattedMessage
                        id='search_results.noResults.partialPhraseSuggestion'
                        defaultMessage='If you&#39;re searching a partial phrase (ex. searching "rea", looking for "reach" or "reaction"), append a * to your search term.'
                    />
                </li>,
                <li key='stopWords'>
                    <FormattedMessage
                        id='search_results.noResults.stopWordsSuggestion'
                        defaultMessage='Two letter searches and common words like "this", "a" and "is" won&#39;t appear in search results due to the excessive results returned.'
                    />
                </li>
            ];

            if (global.window.mm_config.DataRetentionEnableMessageDeletion === 'true') {
                tips.push(
                    <li>
                        <FormattedMessage
                            id='search_results.usage.dataRetention'
                            defaultMessage='Only messages posted in the last {days} days are returned. Contact your System Administrator for more detail.'
                            values={{
                                days: global.window.mm_config.DataRetentionMessageRetentionDays
                            }}
                        />
                    </li>
                );
            }

            ctls =
            (
                <div className='sidebar--right__subheader'>
                    <h4>
                        <FormattedMessage
                            id='search_results.noResults'
                            defaultMessage='No results found. Try again?'
                        />
                    </h4>
                    <ul>
                        {tips}
                    </ul>
                </div>
            );
        } else {
            let sortedResults;
            if (this.props.isPinnedPosts) {
                sortedResults = [...results];
                sortedResults.sort((postA, postB) => postB.create_at - postA.create_at);
            } else {
                sortedResults = results;
            }

            ctls = sortedResults.map(function searchResults(post, idx, arr) {
                let profile;
                if (UserStore.getCurrentId() === post.user_id) {
                    profile = UserStore.getCurrentUser();
                } else {
                    profile = profiles[post.user_id];
                }

                let status = 'offline';
                if (this.state.statuses) {
                    status = this.state.statuses[post.user_id] || 'offline';
                }

                let isFlagged = false;
                if (this.props.isFlaggedByPostId) {
                    isFlagged = this.props.isFlaggedByPostId.get(post.id) || false;
                }

                const reverseCount = arr.length - idx - 1;

                return (
                    <SearchResultsItem
                        key={post.id}
                        channel={this.props.channels.get(post.channel_id)}
                        compactDisplay={this.props.compactDisplay}
                        post={post}
                        lastPostCount={(reverseCount >= 0 && reverseCount < Constants.TEST_ID_COUNT) ? reverseCount : -1}
                        user={profile}
                        term={searchTerms}
                        isMentionSearch={this.props.isMentionSearch}
                        isFlaggedSearch={this.props.isFlaggedPosts}
                        useMilitaryTime={this.props.useMilitaryTime}
                        shrink={this.props.shrink}
                        isFlagged={isFlagged}
                        isBusy={this.state.isBusy}
                        status={status}
                        onSelect={this.props.selectPost}
                    />
                );
            }, this);
        }

        return (
            <div className='sidebar-right__body'>
                <SearchResultsHeader
                    isMentionSearch={this.props.isMentionSearch}
                    toggleSize={this.props.toggleSize}
                    shrink={this.props.shrink}
                    isFlaggedPosts={this.props.isFlaggedPosts}
                    isPinnedPosts={this.props.isPinnedPosts}
                    channelDisplayName={this.props.channelDisplayName}
                    isLoading={this.props.loading}
                />
                <div
                    id='search-items-container'
                    className='search-items-container'
                >
                    {ctls}
                </div>
            </div>
        );
    }
}
