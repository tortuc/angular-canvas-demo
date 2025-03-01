import { Component, ElementRef, AfterViewInit, ViewChild, input } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'

@Component({
    selector: 'app-canvas',
    template: `
        <h1 class="text-center">Welcome to {{title}}!</h1>
        <div class="text-center">
            <canvas #canvas></canvas>
        </div>
        <div class="text-center">
            <button (click)="clear()">Clear</button>
        </div>
        <p class="text-center">Authorized by <a target="_blank" href="https://github.com/tortuc"><b>tortuc</b></a></p>
    `,
    styles: [`
        .text-center { text-align: center; }
        canvas { border: 1px solid #000; }
        button {
            font-size: 20px;
            padding: 10px 20px;
            border-radius: 32px;
            margin-top: 15px;
            cursor: pointer;
        }
        h1 { padding-top: 20px; }
    `],
})
export class CanvasComponent implements AfterViewInit {
    width = input(500);
    height = input(500);
    @ViewChild('canvas') public canvas: ElementRef | undefined;

    public title = 'Angular Canvas Demo';
    private cx!: CanvasRenderingContext2D;

    public ngAfterViewInit() {
        const canvasEl: HTMLCanvasElement = this.canvas?.nativeElement;
        this.cx = canvasEl.getContext('2d') as CanvasRenderingContext2D;

        canvasEl.width = this.width();
        canvasEl.height = this.height();

        this.cx.lineWidth = 3;
        this.cx.lineCap = 'round';
        this.cx.strokeStyle = '#000';

        this.captureEvents(canvasEl);
    }

    public clear() {
        const canvas = this.canvas?.nativeElement;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    private captureEvents(canvasEl: HTMLCanvasElement) {
        // this will capture all mousedown events from the canvas element
        fromEvent(canvasEl, 'mousedown')
            .pipe(
                switchMap((e) => {
                    // after a mouse down, we'll record all mouse moves
                    return fromEvent(canvasEl, 'mousemove')
                        .pipe(
                            // we'll stop (and unsubscribe) once the user releases the mouse
                            // this will trigger a 'mouseup' event    
                            takeUntil(fromEvent(canvasEl, 'mouseup')),
                            // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
                            takeUntil(fromEvent(canvasEl, 'mouseleave')),
                            // pairwise lets us get the previous value to draw a line from
                            // the previous point to the current point    
                            pairwise()
                        )
                })
            )
            .subscribe((res) => {
                const rect = canvasEl.getBoundingClientRect();

                // previous and current position with the offset
                const prevPos = {
                    x: (res[0] as MouseEvent).clientX - rect.left,
                    y: (res[0] as MouseEvent).clientY - rect.top
                };

                const currentPos = {
                    x: (res[1] as MouseEvent).clientX - rect.left,
                    y: (res[1] as MouseEvent).clientY - rect.top
                };

                // this method we'll implement soon to do the actual drawing
                this.drawOnCanvas(prevPos, currentPos);
            });
    }

    private drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }) {
        if (!this.cx) { return; }

        this.cx.beginPath();

        if (prevPos) {
            this.cx.moveTo(prevPos.x, prevPos.y); // from
            this.cx.lineTo(currentPos.x, currentPos.y);
            this.cx.stroke();
        }
    }

}
