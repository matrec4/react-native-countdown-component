import React, {useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  AppState
} from 'react-native';
import _ from 'lodash';
import {sprintf} from 'sprintf-js';

const DEFAULT_DIGIT_STYLE = {backgroundColor: '#FAB913'};
const DEFAULT_DIGIT_TXT_STYLE = {color: '#000'};
const DEFAULT_TIME_LABEL_STYLE = {color: '#000'};
const DEFAULT_SEPARATOR_STYLE = {color: '#000'};
const DEFAULT_TIME_TO_SHOW = ['D', 'H', 'M', 'S'];
const DEFAULT_TIME_LABELS = {
  d: 'Days',
  h: 'Hours',
  m: 'Minutes',
  s: 'Seconds',
};

const CountDown = (props) => {
  
  const [until, setUntil] = useState(Math.max(props.until, 0))
  const [lastUntil, setLastUntil] = useState(null)
  const [wentBackgroundAt, setWentBackgroundAt] = useState(null)

  // state = {
  //   until: Math.max(this.props.until, 0),
  //   lastUntil: null,
  //   wentBackgroundAt: null,
  //  eventListener: null, // NEW LINE
  // };

  // constructor(props) {
  //   super(props);
  //   this.timer = 
  // }

  useEffect(() => {
    const subscription = AppState.addEventListener('change', _handleAppStateChange); // MODIFIED
    const timer = setInterval(updateTimer, 1000);
    return () => {
      subscription.remove();
      clearInterval(timer);
    }
  }, [])


  const _handleAppStateChange = useCallback(currentAppState => {
    if (currentAppState === 'active' && wentBackgroundAt && props.running) {
      const diff = (Date.now() - wentBackgroundAt) / 1000.0;
      setLastUntil(until)
      setUntil(Math.max(0, until - diff))
    }
    if (currentAppState === 'background') {
      setWentBackgroundAt(Date.now())
    }
  },[until, wentBackgroundAt])

  const getTimeLeft = useCallback(() => {
    return {
      seconds: until % 60,
      minutes: parseInt(until / 60, 10) % 60,
      hours: parseInt(until / (60 * 60), 10) % 24,
      days: parseInt(until / (60 * 60 * 24), 10),
    };
  }, [until]);

  const updateTimer = useCallback(() => {
    // Don't fetch these values here, because their value might be changed
    // in another thread
    // const {lastUntil, until} = this.state;

    if (lastUntil === until || !props.running) {
      return;
    }
    if (until === 1 || (until === 0 && lastUntil !== 1)) {
      if (props.onFinish) {
        props.onFinish();
      }
      if (props.onChange) {
        props.onChange(until);
      }
    }

    if (until === 0) {
      setUntil(0)
      setLastUntil(0)
    } else {
      if (props.onChange) {
        props.onChange(until);
      }
      setUntil(Math.max(0, until - 1))
      setLastUntil(until)
    }
  }, [until, lastUntil]);

  const renderDigit = (d) => {
    const {digitStyle, digitTxtStyle, size} = props;
    return (
      <View style={[
        styles.digitCont,        
        {width: size * 2.3, height: size * 2.6},
        digitStyle,
      ]}>
        <Text style={[
          styles.digitTxt,
          {fontSize: size},
          digitTxtStyle,
        ]}>
          {d}
        </Text>
      </View>
    );
  };

  const renderLabel = label => {
    const {timeLabelStyle, size} = props;
    if (label) {
      return (
        <Text style={[
          styles.timeTxt,
          {fontSize: size / 1.8},
          timeLabelStyle,
        ]}>
          {label}
        </Text>
      );
    }
  };

  const renderDoubleDigits = (label, digits) => {
    return (
      <View style={styles.doubleDigitCont}>
        <View style={styles.timeInnerCont}>
          {renderDigit(digits)}
        </View>
        {renderLabel(label)}
      </View>
    );
  };

  const renderSeparator = () => {
    const {separatorStyle, size} = props;
    return (
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Text style={[
          styles.separatorTxt,
          {fontSize: size * 1.2},
          separatorStyle,
        ]}>
          {':'}
        </Text>
      </View>
    );
  };

  const renderCountDown = () => {
    const {timeToShow, timeLabels, showSeparator} = props;
    const {days, hours, minutes, seconds} = getTimeLeft();
    const newTime = sprintf('%02d:%02d:%02d:%02d', days, hours, minutes, seconds).split(':');
    const Component = props.onPress ? TouchableOpacity : View;

    return (
      <Component
        style={styles.timeCont}
        onPress={props.onPress}
      >
        {timeToShow.includes('D') ? renderDoubleDigits(timeLabels.d, newTime[0]) : null}
        {showSeparator && timeToShow.includes('D') && timeToShow.includes('H') ? renderSeparator() : null}
        {timeToShow.includes('H') ? renderDoubleDigits(timeLabels.h, newTime[1]) : null}
        {showSeparator && timeToShow.includes('H') && timeToShow.includes('M') ? renderSeparator() : null}
        {timeToShow.includes('M') ? renderDoubleDigits(timeLabels.m, newTime[2]) : null}
        {showSeparator && timeToShow.includes('M') && timeToShow.includes('S') ? renderSeparator() : null}
        {timeToShow.includes('S') ? renderDoubleDigits(timeLabels.s, newTime[3]) : null}
      </Component>
    );
  };


    return (
      <View style={this.props.style}>
        {renderCountDown()}
      </View>
    );
  
}

CountDown.defaultProps = {
  digitStyle: DEFAULT_DIGIT_STYLE,
  digitTxtStyle: DEFAULT_DIGIT_TXT_STYLE,
  timeLabelStyle: DEFAULT_TIME_LABEL_STYLE,
  timeLabels: DEFAULT_TIME_LABELS,
  separatorStyle: DEFAULT_SEPARATOR_STYLE,
  timeToShow: DEFAULT_TIME_TO_SHOW,
  showSeparator: false,
  until: 0,
  size: 15,
  running: true,
};

const styles = StyleSheet.create({
  timeCont: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timeTxt: {
    color: 'white',
    marginVertical: 2,
    backgroundColor: 'transparent',
  },
  timeInnerCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitCont: {
    borderRadius: 5,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doubleDigitCont: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitTxt: {
    color: 'white',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums']
  },
  separatorTxt: {
    backgroundColor: 'transparent',
    fontWeight: 'bold',
  },
});

CountDown.propTypes = {
  id: PropTypes.string,
  digitStyle: PropTypes.object,
  digitTxtStyle: PropTypes.object,
  timeLabelStyle: PropTypes.object,
  separatorStyle: PropTypes.object,
  timeToShow: PropTypes.array,
  showSeparator: PropTypes.bool,
  size: PropTypes.number,
  until: PropTypes.number,
  onChange: PropTypes.func,
  onPress: PropTypes.func,
  onFinish: PropTypes.func,
};

export default CountDown;
export { CountDown };
