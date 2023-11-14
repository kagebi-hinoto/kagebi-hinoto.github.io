const add_content = (url, resolution) => {
    resolution = resolution || '_240p'

    const layout = document.querySelector('#layout');
    const panel = document.createElement('div');
    panel.innerHTML = `<div class="${resolution}"></div>
    <div class="control">
        <span class="gg-icon gg-close"></span>
        <span class="gg-icon gg-zoom-in"></span>
        <span class="gg-icon gg-zoom-out"></span>
        <span class="gg-icon gg-chevron-double-up"></span>
        <span class="gg-icon gg-chevron-double-down"></span>
    </div>`;

    const main = document.querySelector('#main');
    const content = document.createElement('div');
    content.className = 'content';
    content.innerHTML = `<iframe 
        class="${resolution}"
        src="${url}"
        frameborder="0"
        allow="fullscreen"
        sandbox="allow-storage-access-by-user-activation
                 allow-scripts
                 allow-same-origin
                 allow-presentation"></iframe>`;

    const observers = [ResizeObserver, MutationObserver].map(observer =>
        new observer(() => {
            content.style['top'] = `${panel.offsetTop + panel.clientTop}px`;
            content.style['left'] = `${panel.offsetLeft + panel.clientLeft}px`;
        })
    );
    observers[0].observe(layout);
    observers[1].observe(layout, { childList: true, attributes: true, subtree: true });

    const iframe = content.querySelector('iframe');
    // iframe.addEventListener('load', ev => {
    //     console.log(iframe.contentWindow.location);
    // });
    [
        ['.gg-close', ev => {
            observers.forEach(v => v.disconnect());
            main.removeChild(content);
            layout.removeChild(panel);
        }],
        ['.gg-zoom-in', ev => {
            [
                // '_1080p',
                '_720p',
                '_480p',
                '_360p',
                '_240p',
                '_144p',
                '_120p',
            ].forEach((v, i, a) => {
                if (i > 0) {
                    panel.firstChild.classList.replace(v, a[i - 1]);
                    iframe.classList.replace(v, a[i - 1]);
                }
            });
        }],
        ['.gg-zoom-out', ev => {
            [
                '_120p',
                '_144p',
                '_240p',
                '_360p',
                '_480p',
                '_720p',
                // '_1080p',
            ].forEach((v, i, a) => {
                if (i > 0) {
                    panel.firstChild.classList.replace(v, a[i - 1]);
                    iframe.classList.replace(v, a[i - 1]);
                }
            });
        }],
        ['.gg-chevron-double-up', ev => {
            layout.firstChild.before(panel);
        }],
        ['.gg-chevron-double-down', ev => {
            layout.lastChild.after(panel);
        }],
    ].forEach(([selector, callback]) => {
        panel.querySelector(selector).addEventListener('click', callback);
    });
    panel.addEventListener('dblclick', ev => {
        iframe.src = url;
    });

    main.appendChild(content);
    layout.appendChild(panel);
};

document.addEventListener('DOMContentLoaded', () => {
    const redirect = url => {
        const ytparams = new URLSearchParams({
            autoplay: 1,
            enablejsapi: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            origin: "*"
        });
        switch (true) {
            case /\.youtube\.com\/watch\?/.test(url): {
                add_content(`${url.origin}/embed/${url.searchParams.get('v')}?${ytparams.toString()}`);
            } break;
            case /\.youtube\.com\/live\//.test(url): {
                add_content(`${url.origin}/embed/${url.pathname.replace(/.*\//, '')}?${ytparams.toString()}`);
            } break;
            default: {
                add_content(url.href);
            } break;
        }
    };
    const command = document.querySelector('#command');
    command.addEventListener('input', ev => {
        redirect(new URL(command.value));
        command.value = '';
    });
    const droparea = document.querySelector('#droparea');
    document.addEventListener('dragenter', ev => {
        droparea.classList.remove('disabled');
    });
    ['dragleave', 'click'/* for safety */].forEach(v => {
        droparea.addEventListener(v, ev => {
            droparea.classList.add('disabled');
        });
    });
    droparea.addEventListener('dragover', ev => {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'move';
    });
    droparea.addEventListener('drop', ev => {
        ev.preventDefault();
        droparea.classList.add('disabled');
        const data = ev.dataTransfer.getData('text/plain');
        redirect(new URL(data));
    });
    window.addEventListener('beforeunload', ev => {
        ev.preventDefault();
        ev.returnValue = '';
    });
});
document.addEventListener('keydown', ev => {
    if (ev.ctrlKey) {
        const command = document.querySelector('#command');
        command.value = '';
        command.focus();
    }
});

// EOF //
