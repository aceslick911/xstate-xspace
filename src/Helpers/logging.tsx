import { CONFIG } from './config';

const analyse = firstparam => {
  try {
    if (firstparam && typeof firstparam === 'string') {
      return {
        isRead:
          firstparam?.indexOf &&
          firstparam.indexOf('READ ') === 0 &&
          firstparam,
      };
    } else {
      return {
        isRead: false,
      };
    }
  } catch (err) {
    log('analysis error ', err);
    return { isRead: false };
  }
};
const lastMsg = [analyse('')];

let xStateLogger = undefined as (...args) => void | undefined;

export const initializeXStateLogger = (logger: typeof xStateLogger) => {
  xStateLogger = logger;
};

export const log = (...params) => {
  try {
    if (!CONFIG.logging.enabled) return;
    // console.log('TRYING', { params });
    const firstParam = (params || [''])[0];
    const thisMsg = analyse(firstParam);
    const lastStack =
      lastMsg.length > 0 ? lastMsg[lastMsg.length - 1] : analyse('');

    if (
      lastStack.isRead !== false && // lsg msg was a read
      thisMsg.isRead !== false && // this msg is a read
      thisMsg.isRead !== lastStack.isRead //this msg is diff to last
    ) {
      //Close old
      console.groupEnd();
      lastMsg.pop();

      //Open new
      console.groupCollapsed(firstParam);
      lastMsg.push(thisMsg);
    } else if (
      lastStack.isRead !== false &&
      thisMsg.isRead !== lastStack.isRead
    ) {
      console.groupEnd();

      lastMsg.pop();
    }

    if (CONFIG.logging.logToXState && xStateLogger !== undefined) {
      xStateLogger(params);
    }

    console.log(...params);
  } catch (err) {
    console.log('ERROR LOGGING!!!', err);
  }
};

export const openGroup = groupName => {
  const lastStack =
    lastMsg.length > 0 ? lastMsg[lastMsg.length - 1] : analyse('');
  if (lastStack.isRead !== false) {
    console.groupEnd();
    lastMsg.pop();
  }
  console.group(groupName);
};

const passwordObfuscator = /(password=)([\w0-9_!@^,.\s]+)("?)/gi;

export const obfuscate = (input: string) =>
  input.replace(passwordObfuscator, '$1*****$3');

const savedExceptions = [];

export const trip =
  (
    throwError: boolean | number,
    defaultVal: any,
    file?: string,
    method?: string,
  ) =>
  (err: any) => {
    if (typeof throwError === 'number') {
      log(`📛 Caught Exception (ID=${throwError}):`, err);
    } else {
      log('📛 Caught Exception:', err);
    }

    if (err?.stack) {
      savedExceptions.push({ sender: file || err?.stack, err, method });
    } else {
      savedExceptions.push({ sender: file || 'unknown', err, method });
    }

    log('👀', throwError);

    if (!defaultVal) {
      log('WARNING - returning nothing!!', defaultVal);
    }
    return defaultVal;
  };

function isPromise(p) {
  if (typeof p === 'object' && typeof p.then === 'function') {
    return true;
  }

  return false;
}

export const handle = (method: () => any, defaultVal: any, id: number) => {
  try {
    const result = method();
    if (isPromise(result)) {
      return result.catch(trip(id, defaultVal || 99, 'x', 'y'));
    } else {
      return result;
    }
  } catch (err) {
    log('📛 2HANDLED with ERR, Returned:', id, defaultVal);
    trip(id, defaultVal, 'xx', 'yy')(err);
    return defaultVal;
  }
};
